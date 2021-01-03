import hljs from "highlight.js"; // import hljs library

export function Highlighter(
    content: string,
    language?: string | null,
    key?: string
): JSX.Element {
    if (language === null) {
        return (
            <pre className="hljs" key={key}>
                <code
                    className="hljs"
                    dangerouslySetInnerHTML={{ __html: content }}
                />
            </pre>
        );
    }

    const highlighted = language
        ? hljs.highlight(language, content)
        : hljs.highlightAuto(content);

    return (
        <pre className="hljs" key={key}>
            <code
                className="hljs"
                dangerouslySetInnerHTML={{ __html: highlighted.value }}
            />
        </pre>
    );
}
