# source this on a mac to render icons from an svg
function renderIcons {
  sizes=(1024 512 256 128 96 64 48 32 24 16)

  for size in ${sizes[@]}; do
    inkscape -z -w $size -h $size $1 --export-filename icon_${size}x${size}.png
  done

  mv icon_1024x1024.png icon_512x512@2x.png
  cp icon_512x512.png icon_256x256@2x.png
  cp icon_256x256.png icon_128x128@2x.png
  cp icon_128x128.png icon_64x64@2x.png
  cp icon_64x64.png icon_32x32@2x.png
  cp icon_32x32.png icon_16x16@2x.png

  convert icon_16x16.png icon_32x32.png icon_32x32.png icon_64x64.png icon_128x128.png icon_256x256.png icon.ico

  mkdir icon.iconset
  rm -rf icon.png
  mv *.png icon.iconset

  iconutil -c icns icon.iconset

  cp icon.iconset/icon_256x256.png icon.png
}
