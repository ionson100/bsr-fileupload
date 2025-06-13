import React, { type CSSProperties, type ReactElement } from 'react';
type StateUpload = {
    files: File[];
    uploadProgress: number;
    isDragging: boolean;
    isUploading: boolean;
    errorMessage: string | undefined;
};
type PropsUpload = {
    url: string;
    style?: CSSProperties;
    buttonStyle?: CSSProperties;
    className?: string;
    classNameDropZone?: string;
    id?: string;
    useModeMultipleFiles?: boolean;
    modeAppendFiles?: 'batch' | 'portion' | undefined;
    accept?: string;
    onPreUpload?: (formData: FormData, xhr: XMLHttpRequest) => boolean;
    onError?: (response: ResponseUpload) => void;
    onSuccess?: (response: ResponseUpload) => void;
    onAbort?: (response: ResponseUpload) => void;
    useHiddenButtonUpload?: boolean;
    useHiddenButtonSelectFile?: boolean;
    useHiddenButtonAbort?: boolean;
    onShowmenButtonUpload?: (isVisible: boolean) => void;
    onShowmenButtonAbort?: (isVisible: boolean) => void;
    renderFileItem?: (file: File) => ReactElement;
    onSetRequestUserData?: () => {
        [key: string]: string;
    };
    onSetRequestHeader?: () => {
        [key: string]: string;
    };
    dropZoneContent?: string | ReactElement;
    buttonFileUploadContent?: string | ReactElement;
    buttonSelectFilesContent?: string | ReactElement;
    buttonAbortContent?: string | ReactElement;
    onValidateFiles?: (files: File[]) => string | undefined;
    modeAutoUpload?: boolean;
    heightZone?: number;
    classNameButton?: string;
};
type ResponseUpload = {
    status: number;
    statusText: string;
    responseText: string | undefined;
};
export declare class FileUpload extends React.Component<PropsUpload, StateUpload> {
    private xhr;
    private _appendForm;
    private mRefInput;
    private mRefForm;
    private mRefDrag;
    private mRefContainer;
    private _url;
    constructor(props: Readonly<PropsUpload>);
    GetUrl(): string | undefined;
    SetUrl(url: string | undefined): void;
    SetFormData(data: {
        [key: string]: string;
    }): void;
    FileUpload(): void | null;
    private handleFileUpload;
    private deleteFile;
    private renderNameFile;
    private fileSizeChange;
    SelectFiles(): void;
    Abort(): void;
    ClearFiles(): void;
    render(): React.JSX.Element;
}
export {};
