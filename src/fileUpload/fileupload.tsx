import React, {type CSSProperties, type ReactElement} from 'react';



type StateUpload={
    files: File[]
    uploadProgress:number
    isDragging:boolean
    isUploading:boolean
    errorMessage:string|undefined

}
type PropsUpload={
    url:string
    style?:CSSProperties
    buttonStyle?:CSSProperties
    className?:string
    classNameDropZone?:string
    id?:string
    useModeMultipleFiles?: boolean
    modeAppendFiles?:'batch'|'portion'|undefined
    accept?:string
    onPreUpload?:(formData:FormData, xhr:XMLHttpRequest) => boolean
    onError?:(response:ResponseUpload) => void
    onSuccess?:(response:ResponseUpload) => void
    onAbort?:(response:ResponseUpload) => void
    useHiddenButtonUpload?:boolean
    useHiddenButtonSelectFile?:boolean
    useHiddenButtonAbort?:boolean
    onShowmenButtonUpload?:(isVisible:boolean) => void
    onShowmenButtonAbort?:(isVisible:boolean) => void
    renderFileItem?:(file:File) => ReactElement
    onSetRequestUserData?:() => {[key: string]: string}
    onSetRequestHeader?:() => {[key: string]: string}
    dropZoneContent?:string|ReactElement
    buttonFileUploadContent?:string|ReactElement
    buttonSelectFilesContent?:string|ReactElement
    buttonAbortContent?:string|ReactElement
    onValidateFiles?:(files:File[]) => string|undefined
    modeAutoUpload?:boolean
    heightZone?:number
    classNameButton?:string

}

type ResponseUpload = {
    status:number,
    statusText:string;
    responseText:string|undefined
}

 export class FileUpload extends React.Component<PropsUpload,StateUpload> {
     private  xhr:XMLHttpRequest|undefined=undefined;
     private  _appendForm:{[key: string]: string}|undefined=undefined;
     private mRefInput=React.createRef<HTMLInputElement>()
     private mRefForm=React.createRef<HTMLFormElement>()
     private mRefDrag=React.createRef<HTMLDivElement>()
     private mRefContainer=React.createRef<HTMLDivElement>()
     private _url: string | undefined;
    constructor(props:Readonly<PropsUpload>) {
        super(props);
        this.state = {
            files: [],
            errorMessage:undefined,
            uploadProgress: 0,
            isUploading: false,
            isDragging: false,

        };
    }
    GetUrl(): string|undefined {
        return this._url
    }
    SetUrl(url:string|undefined):void {
        this._url = url;
    }
    SetFormData(data:{[key: string]: string}):void {
        this._appendForm=data
    }
    public FileUpload() {
        if (this.state.files.length > 0 && !this.state.isUploading) {
            return this.handleFileUpload()
        }
        return null;

    }



    private handleFileUpload = () => {
        const getParam=(xhr:XMLHttpRequest):ResponseUpload=>{
            return  {statusText:xhr.statusText,status:xhr.status, responseText:xhr.responseText}
        }
        const getStrError=(xhr:XMLHttpRequest):string=>{
            return `status:${xhr.status} ${xhr.statusText??'empty'}: ${xhr.responseText??'empty'}`
        }
        this.setState({ isUploading: true, uploadProgress: 0,errorMessage:undefined });


        this.xhr = new XMLHttpRequest();
        try {

            const formData = new FormData();

            if(this._appendForm){
                Object.entries(this._appendForm).forEach(([key,value]) => {
                    formData.append(key, value)
                })

            }
            if (this.props.onSetRequestUserData){
                const data=this.props.onSetRequestUserData()
                Object.entries(data).forEach(([key, value]) => {
                    formData.append(key,value)
                })


            }



            this.state.files.forEach((file) => formData.append('file', file));


            if (this.props.onSetRequestHeader){
                const data=this.props.onSetRequestHeader()
                Object.entries(data).forEach(([key, value]) => {
                    this.xhr?.setRequestHeader(key,value)
                })


            }

            this.xhr.onabort = () => {
                if(this.props.onAbort){
                    this.props.onAbort(getParam(this.xhr!))
                }
                this.setState({
                    isUploading: false,
                    errorMessage:'abort'
                })
            }

            if(this.props.onPreUpload){
                if (!this.props.onPreUpload(formData,this.xhr)) {
                    this.setState({ isUploading: false, files: [], uploadProgress: 100 });
                    return;
                }
            }
            this.xhr.onerror = () => {

                console.error(this.xhr)
                if(this.props.onError){
                    this.props.onError(getParam(this.xhr!));

                }
                this.setState({
                    isUploading: false,
                    errorMessage:getStrError(this.xhr!)
                })

            }
            this.xhr.upload.addEventListener('progress', (event) => {
                if (event.lengthComputable) {
                    const progress = Math.round((event.loaded / event.total) * 100);
                    this.setState({ uploadProgress: progress });
                }
            });
            this.xhr.open('POST', this._url?this._url:this.props.url); // Replace with your upload URL
            this.xhr.send(formData);
            this.xhr.onload = () => {

                if (this.xhr!.status !== 200) {

                    if(this.props.onError){
                        this.props.onError(getParam(this.xhr!));
                    }
                    this.setState({
                        isUploading: false,
                        errorMessage:getStrError(this.xhr!)
                    })
                    return;
                }
                if(this.props.onSuccess){
                    this.props.onSuccess(getParam(this.xhr!));
                }
                this.setState({ isUploading: false, files: [], uploadProgress: 100 });
            };

        } catch (error) {
            console.log(error);
            if(this.props.onError){
                this.props.onError(getParam(this.xhr));
            }
            this.setState({
                isUploading: false,
                errorMessage:getStrError(this.xhr)
            })
        }
    };

    private deleteFile = (index:number) => {
        if(this.state.files.length===1){
            this.mRefForm.current!.reset()
            this.setState({files:[],errorMessage:undefined})
            return;
        }
        const f=this.state.files;
        f.splice(index,1);
        this.setState({files:f,errorMessage:undefined});
    }
    private renderNameFile(file: File,index:number) {
        return (
            <div key={index} className={'item-file'}>
                <div className={'host-icon'}>
                    <div className={'size-file total-size'}>size: {`${file.size} byte`}</div>
                    {
                        !this.state.isUploading&&(<a href="#" className="close-123" onClick={()=>this.deleteFile(index)}/>)
                    }

                </div>
                {this.props.renderFileItem?this.props.renderFileItem(file):(<div style={{textAlign:'left'}}>{file.name}</div>)}

            </div>
        )
    }

    private fileSizeChange = () => {
        let total=0;
        this.state.files.forEach(file => {
            total+=file.size;
        })
        if(total===0){
            return `total size: 0`;
        }

        return `total size: ${total} byte`;
    }




    SelectFiles(){
        this.mRefInput.current!.click();
    }
    Abort(){
        this.xhr?.abort()
    }
    ClearFiles(){
        this.mRefForm.current!.reset()
        this.setState({files:[],errorMessage:undefined})
    }


     render() {
        setTimeout(()=>{
            if(this.props.onShowmenButtonUpload){
                const state=this.state.files.length > 0&&!this.state.isUploading;
                this.props.onShowmenButtonUpload(state);
            }
            if(this.props.onShowmenButtonAbort){
                this.props.onShowmenButtonAbort(this.state.isUploading);
            }
        })

        return (
            <div
                data-fuid="fileUpload"
                id={this.props.id}
                style={this.props.style}
                ref={this.mRefContainer}
                className={this.props.className?this.props.className:'container-fu'}>
                <div  className={'header'} >
                    <div  className='fu-error-panel'>{this.state.errorMessage}</div>
                    {
                        this.props.useModeMultipleFiles&&(<div className={'total-size'}>{this.fileSizeChange()}</div>)
                    }
                </div>


                <progress   className={'progress'}
                          style={{visibility:this.state.isUploading?"visible":"collapse"}}
                          value={this.state.uploadProgress} max="100" />



                <div

                    ref={this.mRefDrag}
                    style={{height:this.props.heightZone??200}}

                    className={` ${this.props.classNameDropZone?this.props.classNameDropZone:`drop-zone ${this.state.files.length===0?'border-zone':null}`} ${this.state.isDragging ? 'dragging' : ''}`}
                    onDragOver={event => {
                        if(this.state.isUploading) return false;
                        event.preventDefault();
                        this.setState({ isDragging: true });
                    }}
                    onDragEnter={event => {
                        event.preventDefault();
                        if(this.state.isUploading) return false;
                        this.setState({ isDragging: true });
                    }}
                    onDragLeave={event => {
                        event.preventDefault();
                        if(this.state.isUploading) return false;
                        this.setState({ isDragging: false });
                    }}
                    onDrop={event => {
                        event.preventDefault();
                        if(this.state.isUploading) return false;
                        this.setState({ isDragging: false });
                        //const droppedFiles:File[] = Array.from(event.dataTransfer.files);
                        let droppedFiles:File[] = [];
                        if(this.props.useModeMultipleFiles===true&&this.props.modeAppendFiles==='portion') {
                            droppedFiles=this.state.files
                            Array.from(event.dataTransfer.files).forEach((file:File) => {
                                droppedFiles.push(file)
                            })
                        }else {
                            droppedFiles = Array.from(event.dataTransfer.files);
                        }



                        this.setState({
                            errorMessage:undefined,
                            files: droppedFiles
                        });
                    }}
                >


                    {
                        this.state.files.map((file, i) => {
                            return this.renderNameFile(file,i);
                        })
                    }
                    <div className={'drop-zone-text-container'} style={{display:this.state.files.length!==0?"none":"block"}}>
                        <div className={'drop-zone-text-item'}>
                            <p>
                                {
                                    this.props.dropZoneContent?this.props.dropZoneContent:'Drag and drop files here'
                                }
                            </p>

                        </div>
                    </div>



                    <form ref={this.mRefForm}>
                        <input

                            ref={this.mRefInput}
                            hidden
                            type="file"
                            accept={this.props.accept}
                            multiple={this.props.useModeMultipleFiles??false}
                            onChange={(event: React.ChangeEvent<HTMLInputElement>)=>{

                                let droppedFiles:File[] = [];
                                if(this.props.useModeMultipleFiles===true&&this.props.modeAppendFiles==='portion') {
                                    droppedFiles=this.state.files
                                    Array.from(event.target.files!).forEach((file:File) => {
                                        droppedFiles.push(file)
                                    })

                                }else {
                                    droppedFiles = Array.from(event.target.files!);
                                }

                                if(this.props.onValidateFiles) {
                                    const res=this.props.onValidateFiles(droppedFiles);
                                    if(res) {
                                        this.setState({errorMessage:res});
                                        return;
                                    }
                                }
                                this.setState({
                                    errorMessage:undefined,
                                    files: droppedFiles});
                                if(this.props.modeAutoUpload) {
                                    setTimeout(()=>{
                                        this.handleFileUpload()
                                    },100)

                                }

                            }}

                        />
                    </form>



                </div>
                <div  className={'footer'} >
                    {
                        this.props.useHiddenButtonAbort===true?null:(
                            this.state.isUploading && (
                                <button
                                    className={this.props.classNameButton?`${this.props.classNameButton} button-123-abort`:'button-123 button-123-abort'}
                                    data-abort={'1'}
                                    style={this.props.buttonStyle}
                                    onClick={()=>{

                                        this.xhr?.abort()
                                    }}>
                                    {
                                        this.props.buttonAbortContent?this.props.buttonAbortContent:'abort'
                                    }
                                </button>
                            )
                        )

                    }

                    {(this.state.files.length > 0&&!this.state.isUploading&&!this.props.useHiddenButtonUpload) && (
                        <button
                            style={this.props.buttonStyle}
                            className={this.props.classNameButton??'button-123'}
                            data-upload={'1'}
                            onClick={this.handleFileUpload}
                            disabled={this.state.isUploading}>
                            {
                                this.props.buttonFileUploadContent?this.props.buttonFileUploadContent:'upload'
                            }

                        </button>
                    )}
                    {
                        this.props.useHiddenButtonSelectFile===true?null:(
                            !this.state.isUploading &&(
                                <button
                                    style={this.props.buttonStyle}
                                    data-select={'1'}
                                    className={this.props.classNameButton??'button-123'}
                                    onClick={()=>{
                                    this.mRefInput.current!.click();
                                }}>
                                    {
                                        this.props.buttonSelectFilesContent?this.props.buttonSelectFilesContent:'select files'
                                    }
                                </button>)
                        )

                    }

                </div>
            </div>

        );
    }
}

