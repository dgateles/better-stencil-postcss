import postCss from 'postcss';
import { loadDiagnostic } from './diagnostics';
import type * as d from './declarations';
import * as util from './util';

export function postcss(opts: d.PluginOptions = {}): d.Plugin {
  return {
    name: 'postcss',
    pluginType: 'css',
    transform(sourceText: string, fileName: string, context: d.PluginCtx) {
      // Verifica se há plugins configurados, suportando array ou objeto
      const hasPlugins =
        opts.hasOwnProperty('plugins') &&
        (Array.isArray(opts.plugins)
          ? opts.plugins.length > 0
          : Object.keys(opts.plugins).length > 0);
      if (!hasPlugins) {
        return null;
      }

      if (!context || !util.usePlugin(fileName)) {
        return null;
      }

      const renderOpts = util.getRenderOptions(opts, sourceText, context);
      let plugins = renderOpts.plugins;

      // Se "plugins" não for um array, converte o objeto para array
      if (!Array.isArray(plugins)) {
        plugins = Object.entries(plugins)
          .map(([pluginName, pluginOptions]) => {
            if (pluginOptions === false) {
              return null;
            }
            try {
              // Tenta carregar o plugin via require e aplicá-lo com as opções
              const plugin = require(pluginName);
              if (typeof plugin === 'function') {
                return plugin(pluginOptions);
              }
              // Se não for função, assume que já é um plugin configurado
              return plugin;
            } catch (e) {
              // Em caso de erro, adiciona uma mensagem diagnóstica e ignora o plugin
              context.diagnostics.push({
                level: 'error',
                type: 'plugin',
                messageText: `Erro ao carregar o plugin ${pluginName}: ${e.message}`,
                lines: []
              });
              return null;
            }
          })
          .filter(Boolean);
      }

      const results: d.PluginTransformResults = {
        id: util.createResultsId(fileName),
      };

      if (sourceText.trim() === '') {
        results.code = '';
        return Promise.resolve(results);
      }

      return new Promise<d.PluginTransformResults>((resolve) => {
        postCss(plugins as postCss.AcceptedPlugin[])
          .process(renderOpts.data, {
            from: fileName,
          })
          .then((postCssResults) => {
            const warnings = postCssResults.warnings();

            if (warnings.length > 0) {
              // Emite diagnósticos para cada warning
              warnings.forEach((warn: any) => {
                const err: any = {
                  messageText: warn.text,
                  level: warn.type,
                  column: warn.column || -1,
                  line: warn.line || -1,
                };
                loadDiagnostic(context, err, fileName);
              });

              const mappedWarnings = warnings
                .map((warn: any) => {
                  return `${warn.type} ${warn.plugin ? `(${warn.plugin})` : ''}: ${warn.text}`;
                })
                .join(', ');
              results.code = `/** postcss ${mappedWarnings} **/`;
              resolve(results);
            } else {
              results.code = postCssResults.css.toString();
              results.dependencies = postCssResults.messages
                .filter((message) => message.type === 'dependency')
                .map((dependency) => dependency.file);

              resolve(results);
            }
          })
          .catch((err: any) => {
            loadDiagnostic(context, err, fileName);
            results.code = `/**  postcss error${err && err.message ? ': ' + err.message : ''}  **/`;
            resolve(results);
          });
      });
    },
  };
}