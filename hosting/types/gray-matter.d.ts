declare module 'gray-matter' {
  interface GrayMatterFileBase<T extends string | Buffer = string> {
    content: T;
    data: Record<string, any>;
    excerpt?: string;
    orig?: string;
    language?: string;
    matter: string;
    stringify?: () => string;
    [key: string]: any;
  }

  interface GrayMatterOptionsBase<T extends string | Buffer = string> {
    excerpt?: boolean | ((input: T, file: GrayMatterFileBase<T>) => string);
    engines?: Record<string, any>;
    language?: string;
  }

  function matter<T extends string | Buffer = string>(
    input: T,
    options?: GrayMatterOptionsBase<T>
  ): GrayMatterFileBase<T>;

  namespace matter {
    export type GrayMatterFile<T extends string | Buffer = string> = GrayMatterFileBase<T>;
    export type GrayMatterOptions<T extends string | Buffer = string> = GrayMatterOptionsBase<T>;
  }

  export = matter;
}
