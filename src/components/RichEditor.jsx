import { useEffect, useRef } from 'react';

import clsx from 'clsx';
import { Jodit } from 'jodit';
import 'jodit/esm/plugins/fullsize/fullsize.js';
import 'jodit/esm/plugins/preview/preview.js';
import 'jodit/esm/plugins/source/source.js';
import 'jodit/esm/plugins/spellcheck/spellcheck.js';
import 'jodit/esm/plugins/copy-format/copy-format.js';
import 'jodit/esm/plugins/symbols/symbols.js';
import 'jodit/esm/plugins/indent/indent.js';
import 'jodit/esm/plugins/justify/justify.js';
import 'jodit/esm/plugins/print/print.js';
import 'jodit/esm/plugins/image/image.js';
import 'jodit/esm/plugins/resizer/resizer.js';

import 'jodit/es2018/jodit.min.css';

export const RichTextEditor = () => {
    const ref = useRef(null);

    useEffect(() => {
        Jodit.make(ref.current, {
            theme: 'default',
            toolbarAdaptive: false,
            uploader: {
                insertImageAsBase64URI: true,
            },
            image: {
                editSrc: false,
                editId: false,
                editClass: false,
            },
            language: 'en',
            disablePlugins: 'enter',
            showCharsCounter: false,
            showWordsCounter: false,
            showXPathInStatusbar: false,
            enter: 'DIV',
            buttons: [
                'bold',
                'italic',
                'underline',
                'strikethrough',
                'ul',
                'ol',
                'paragraph',
                'superscript',
                'subscript',
                'brush',
                'image',
                'spellcheck',
                'copyformat',
                'table',
                'link',
                'symbols',
                'indent',
                'outdent',
                'align',
                'source',
                'preview',
                'print',
                'fullsize',
            ],
        });
    }, []);

    return (
        <div className={clsx('editor-wrapper')}>
            <textarea ref={ref} />
        </div>
    );
};
