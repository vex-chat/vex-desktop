import React from "react";
import hljs from "highlight.js"; // import hljs library

export function Highlighter(content: string, language?: string): JSX.Element {
    const highlighted = language
        ? hljs.highlight(language, content)
        : hljs.highlightAuto(content);

    return (
        <pre className="hljs">
            <code
                className="hljs"
                dangerouslySetInnerHTML={{ __html: highlighted.value }}
            />
        </pre>
    );
}
