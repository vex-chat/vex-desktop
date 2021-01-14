import Color from "color";

const DESIRED_CONTRAST = 11;

export const setThemeColor = (colorStr: string): void => {
    const backgroundColor = Color(colorStr);

    document.documentElement.style.setProperty(
        "--theme_base_color",
        backgroundColor.hex()
    );
    let textColor;
    if (backgroundColor.isDark()) {
        document.documentElement.style.setProperty(
            "--theme_color_0",
            backgroundColor.lighten(0.2).hex()
        );
        document.documentElement.style.setProperty(
            "--theme_color_1",
            backgroundColor.lighten(0.4).hex()
        );
        document.documentElement.style.setProperty(
            "--theme_color_2",
            backgroundColor.lighten(0.6).hex()
        );

        textColor = Color("#fff");
        while (textColor.contrast(backgroundColor) > DESIRED_CONTRAST) {
            console.log(textColor.contrast(backgroundColor));
            if (textColor.darken(0.01).hex() === textColor.hex()) {
                break;
            }
            textColor = textColor.darken(0.01);
        }
    } else {
        document.documentElement.style.setProperty(
            "--theme_color_0",
            backgroundColor.darken(0.03).hex()
        );
        document.documentElement.style.setProperty(
            "--theme_color_1",
            backgroundColor.darken(0.06).hex()
        );
        document.documentElement.style.setProperty(
            "--theme_color_2",
            backgroundColor.darken(0.09).hex()
        );

        textColor = Color("#0A0A0A");
        console.log(textColor.lighten(0.1).hex());
        while (textColor.contrast(backgroundColor) > DESIRED_CONTRAST) {
            console.log(textColor.contrast(backgroundColor));
            console.log(textColor.hex());
            if (textColor.lighten(0.1).hex() === textColor.hex()) {
                break;
            }
            textColor = textColor.lighten(0.1);
        }
    }
    document.documentElement.style.setProperty(
        "--text_color_0",
        textColor.hex()
    );
};
