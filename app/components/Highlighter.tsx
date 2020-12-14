import React from "react";
import hljs from "highlight.js"; // import hljs library

export function Highlighter(
    content: string,
    languages?: string[]
): JSX.Element {
    const highlighted = hljs.highlightAuto(content, languages);

    return (
        <pre className="hljs">
            <code
                className="hljs"
                dangerouslySetInnerHTML={{ __html: highlighted.value }}
            />
        </pre>
    );
}
