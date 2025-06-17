'use strict';

var React = require('react');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
    return extendStatics(d, b);
};

function __extends(d, b) {
    if (typeof b !== "function" && b !== null)
        throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var FileUpload = /** @class */ (function (_super) {
    __extends(FileUpload, _super);
    function FileUpload(props) {
        var _this = _super.call(this, props) || this;
        _this.xhr = undefined;
        _this._appendForm = undefined;
        _this.mRefInput = React.createRef();
        _this.mRefForm = React.createRef();
        _this.mRefDrag = React.createRef();
        _this.mRefContainer = React.createRef();
        _this.handleFileUpload = function () {
            var getParam = function (xhr) {
                return { statusText: xhr.statusText, status: xhr.status, responseText: xhr.responseText, fileUpload: _this };
            };
            var getStrError = function (xhr) {
                var _a, _b;
                return "status:".concat(xhr.status, " ").concat((_a = xhr.statusText) !== null && _a !== void 0 ? _a : 'empty', ": ").concat((_b = xhr.responseText) !== null && _b !== void 0 ? _b : 'empty');
            };
            _this.setState({ isUploading: true, uploadProgress: 0, errorMessage: undefined });
            _this.xhr = new XMLHttpRequest();
            try {
                var formData_1 = new FormData();
                if (_this._appendForm) {
                    Object.entries(_this._appendForm).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        formData_1.append(key, value);
                    });
                }
                if (_this.props.addingUserData) {
                    var data = _this.props.addingUserData();
                    Object.entries(data).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        formData_1.append(key, value);
                    });
                }
                _this.state.files.forEach(function (file) { return formData_1.append('file', file); });
                if (_this.props.addingHeader) {
                    var data = _this.props.addingHeader();
                    Object.entries(data).forEach(function (_a) {
                        var _b;
                        var key = _a[0], value = _a[1];
                        (_b = _this.xhr) === null || _b === void 0 ? void 0 : _b.setRequestHeader(key, value);
                    });
                }
                _this.xhr.onabort = function () {
                    if (_this.props.onAbort) {
                        _this.props.onAbort(getParam(_this.xhr));
                    }
                    _this.setState({
                        isUploading: false,
                        errorMessage: 'abort'
                    });
                };
                if (_this.props.onPreUpload) {
                    if (!_this.props.onPreUpload(formData_1, _this.xhr)) {
                        _this.setState({ isUploading: false, files: [], uploadProgress: 100 });
                        return;
                    }
                }
                _this.xhr.onerror = function () {
                    console.error(_this.xhr);
                    if (_this.props.onError) {
                        _this.props.onError(getParam(_this.xhr));
                    }
                    _this.setState({
                        isUploading: false,
                        errorMessage: getStrError(_this.xhr)
                    });
                };
                _this.xhr.upload.addEventListener('progress', function (event) {
                    if (event.lengthComputable) {
                        var progress = Math.round((event.loaded / event.total) * 100);
                        _this.setState({ uploadProgress: progress });
                    }
                });
                _this.xhr.open('POST', _this._url ? _this._url : _this.props.url); // Replace with your upload URL
                _this.xhr.send(formData_1);
                _this.xhr.onload = function () {
                    if (_this.xhr.status !== 200) {
                        if (_this.props.onError) {
                            _this.props.onError(getParam(_this.xhr));
                        }
                        _this.setState({
                            isUploading: false,
                            errorMessage: getStrError(_this.xhr)
                        });
                        return;
                    }
                    if (_this.props.onSuccess) {
                        _this.props.onSuccess(getParam(_this.xhr));
                    }
                    _this.setState({ isUploading: false, files: [], uploadProgress: 100 });
                };
            }
            catch (error) {
                console.log(error);
                if (_this.props.onError) {
                    _this.props.onError(getParam(_this.xhr));
                }
                _this.setState({
                    isUploading: false,
                    errorMessage: getStrError(_this.xhr)
                });
            }
        };
        _this.deleteFile = function (index) {
            if (_this.state.files.length === 1) {
                _this.mRefForm.current.reset();
                _this.setState({ files: [], errorMessage: undefined });
                return;
            }
            var f = _this.state.files;
            f.splice(index, 1);
            _this.setState({ files: f, errorMessage: undefined });
        };
        _this.fileSizeChange = function () {
            var total = 0;
            _this.state.files.forEach(function (file) {
                total += file.size;
            });
            if (total === 0) {
                return "total size: 0";
            }
            return "total size: ".concat(total, " byte");
        };
        _this.state = {
            files: [],
            errorMessage: undefined,
            uploadProgress: 0,
            isUploading: false,
            isDragging: false,
        };
        return _this;
    }
    FileUpload.prototype.GetUrl = function () {
        return this._url;
    };
    FileUpload.prototype.SetUrl = function (url) {
        this._url = url;
    };
    FileUpload.prototype.SetFormData = function (data) {
        this._appendForm = data;
    };
    FileUpload.prototype.FileUpload = function () {
        if (this.state.files.length > 0 && !this.state.isUploading) {
            return this.handleFileUpload();
        }
        return null;
    };
    FileUpload.prototype.renderNameFile = function (file, index) {
        var _this = this;
        return (React.createElement("div", { key: index, className: 'item-file' },
            React.createElement("div", { className: 'host-icon' },
                React.createElement("div", { className: 'size-file total-size' },
                    "size: ", "".concat(file.size, " byte")),
                !this.state.isUploading && (React.createElement("a", { href: "#", className: "close-123", onClick: function () { return _this.deleteFile(index); } }))),
            this.props.renderFileItem ? this.props.renderFileItem(file) : (React.createElement("div", { style: { textAlign: 'left' } }, file.name))));
    };
    FileUpload.prototype.SelectFiles = function () {
        this.mRefInput.current.click();
    };
    FileUpload.prototype.Abort = function () {
        var _a;
        (_a = this.xhr) === null || _a === void 0 ? void 0 : _a.abort();
    };
    FileUpload.prototype.ClearFiles = function () {
        this.mRefForm.current.reset();
        this.setState({ files: [], errorMessage: undefined });
    };
    FileUpload.prototype.render = function () {
        var _this = this;
        var _a, _b, _c, _d;
        setTimeout(function () {
            if (_this.props.onEventFilePresenceChange) {
                var state = _this.state.files.length > 0 && !_this.state.isUploading;
                _this.props.onEventFilePresenceChange(state);
            }
            if (_this.props.onEventFileUploadStatus) {
                _this.props.onEventFileUploadStatus(_this.state.isUploading);
            }
        });
        return (React.createElement("div", { "data-fuid": "fileUpload", id: this.props.id, style: this.props.style, ref: this.mRefContainer, className: this.props.className ? this.props.className : 'container-fu' },
            React.createElement("div", { className: 'header' },
                React.createElement("div", { className: 'fu-error-panel' }, this.state.errorMessage),
                this.props.useModeMultipleFiles && (React.createElement("div", { className: 'total-size' }, this.fileSizeChange()))),
            React.createElement("progress", { className: 'progress', style: { visibility: this.state.isUploading ? "visible" : "collapse" }, value: this.state.uploadProgress, max: "100" }),
            React.createElement("div", { ref: this.mRefDrag, style: { height: (_a = this.props.heightZone) !== null && _a !== void 0 ? _a : 200 }, className: " ".concat(this.props.classNameDropZone ? this.props.classNameDropZone : "drop-zone ".concat(this.state.files.length === 0 ? 'border-zone' : null), " ").concat(this.state.isDragging ? 'dragging' : ''), onDragOver: function (event) {
                    if (_this.state.isUploading)
                        return false;
                    event.preventDefault();
                    _this.setState({ isDragging: true });
                }, onDragEnter: function (event) {
                    event.preventDefault();
                    if (_this.state.isUploading)
                        return false;
                    _this.setState({ isDragging: true });
                }, onDragLeave: function (event) {
                    event.preventDefault();
                    if (_this.state.isUploading)
                        return false;
                    _this.setState({ isDragging: false });
                }, onDrop: function (event) {
                    event.preventDefault();
                    if (_this.state.isUploading)
                        return false;
                    _this.setState({ isDragging: false });
                    //const droppedFiles:File[] = Array.from(event.dataTransfer.files);
                    var droppedFiles = [];
                    if (_this.props.useModeMultipleFiles === true && _this.props.modeAppendFiles === 'portion') {
                        droppedFiles = _this.state.files;
                        Array.from(event.dataTransfer.files).forEach(function (file) {
                            droppedFiles.push(file);
                        });
                    }
                    else {
                        droppedFiles = Array.from(event.dataTransfer.files);
                    }
                    _this.setState({
                        errorMessage: undefined,
                        files: droppedFiles
                    });
                } },
                this.state.files.map(function (file, i) {
                    return _this.renderNameFile(file, i);
                }),
                React.createElement("div", { className: 'drop-zone-text-container', style: { display: this.state.files.length !== 0 ? "none" : "block" } },
                    React.createElement("div", { className: 'drop-zone-text-item' }, this.props.dropZoneContent ? this.props.dropZoneContent : 'Drag and drop files here')),
                React.createElement("form", { ref: this.mRefForm },
                    React.createElement("input", { ref: this.mRefInput, hidden: true, type: "file", accept: this.props.accept, multiple: (_b = this.props.useModeMultipleFiles) !== null && _b !== void 0 ? _b : false, onChange: function (event) {
                            var droppedFiles = [];
                            if (_this.props.useModeMultipleFiles === true && _this.props.modeAppendFiles === 'portion') {
                                droppedFiles = _this.state.files;
                                Array.from(event.target.files).forEach(function (file) {
                                    droppedFiles.push(file);
                                });
                            }
                            else {
                                droppedFiles = Array.from(event.target.files);
                            }
                            if (_this.props.onValidateFiles) {
                                var res = _this.props.onValidateFiles(droppedFiles);
                                if (res) {
                                    _this.setState({ errorMessage: res });
                                    return;
                                }
                            }
                            _this.setState({
                                errorMessage: undefined,
                                files: droppedFiles
                            });
                            if (_this.props.modeAutoUpload) {
                                setTimeout(function () {
                                    _this.handleFileUpload();
                                }, 100);
                            }
                        } }))),
            React.createElement("div", { className: 'footer' },
                this.props.useHiddenButtonAbort === true ? null : (this.state.isUploading && (React.createElement("button", { className: this.props.classNameButton ? "".concat(this.props.classNameButton, " button-123-abort") : 'button-123 button-123-abort', "data-abort": '1', style: this.props.buttonStyle, onClick: function () {
                        var _a;
                        (_a = _this.xhr) === null || _a === void 0 ? void 0 : _a.abort();
                    } }, this.props.buttonAbortContent ? this.props.buttonAbortContent : 'abort'))),
                (this.state.files.length > 0 && !this.state.isUploading && !this.props.useHiddenButtonUpload) && (React.createElement("button", { style: this.props.buttonStyle, className: (_c = this.props.classNameButton) !== null && _c !== void 0 ? _c : 'button-123', "data-upload": '1', onClick: this.handleFileUpload, disabled: this.state.isUploading }, this.props.buttonFileUploadContent ? this.props.buttonFileUploadContent : 'upload')),
                this.props.useHiddenButtonSelectFile === true ? null : (!this.state.isUploading && (React.createElement("button", { style: this.props.buttonStyle, "data-select": '1', className: (_d = this.props.classNameButton) !== null && _d !== void 0 ? _d : 'button-123', onClick: function () {
                        _this.mRefInput.current.click();
                    } }, this.props.buttonSelectFilesContent ? this.props.buttonSelectFilesContent : 'select files'))))));
    };
    return FileUpload;
}(React.Component));

exports.FileUpload = FileUpload;
