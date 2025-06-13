declare module '*.jpg';
declare module '*.png';
declare module '*.woff2';
declare module '*.woff';
declare module '*.ttf';

declare module "*.svg" {
    const content: string;
    export default content;
}