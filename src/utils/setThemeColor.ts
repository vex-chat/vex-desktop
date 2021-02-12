import Color from "color";

import { colors } from "../constants/colors";

const DESIRED_CONTRAST = 11;

export const setThemeColor = (colorStr: "white" | "black"): void => {
    console.log(colors[colorStr]);

    document.documentElement.style.setProperty(
        "--theme_base_color",
        colors[colorStr].theme_color_0
    );

    document.documentElement.style.setProperty(
        "--theme_color_0",
        colors[colorStr].theme_color_0
    );
    document.documentElement.style.setProperty(
        "--theme_color_1",
        colors[colorStr].theme_color_1
    );
    document.documentElement.style.setProperty(
        "--theme_color_2",
        colors[colorStr].theme_color_2
    );
    document.documentElement.style.setProperty(
        "--text_color_0",
        getTextColor(colors[colorStr].theme_color_0)
    );
};

export const _setThemeColor = (colorStr: string): void => {
    const backgroundColor = Color(colorStr);

    document.documentElement.style.setProperty(
        "--theme_base_color",
        backgroundColor.hex()
    );
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
    }
};

const getTextColor = (bgColor: string): string => {
    const backgroundColor = Color(bgColor);

    if (backgroundColor.isDark()) {
        let textColor = Color("#fff");
        while (textColor.contrast(backgroundColor) > DESIRED_CONTRAST) {
            if (textColor.darken(0.01).hex() === textColor.hex()) {
                break;
            }
            textColor = textColor.darken(0.01);
        }
        return textColor.hex();
    } else {
        let textColor = Color("#0A0A0A");
        while (textColor.contrast(backgroundColor) > DESIRED_CONTRAST) {
            if (textColor.lighten(0.1).hex() === textColor.hex()) {
                break;
            }
            textColor = textColor.lighten(0.1);
        }
        return textColor.hex();
    }
};
