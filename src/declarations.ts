export * from '@stencil/core/internal';

export interface PluginOptions {
  plugins?: any[] | { [pluginName: string]: any };
  injectGlobalPaths?: string[];
}

export interface RendererOptions {
  data: string;
  plugins: any[] | { [pluginName: string]: any };
}
