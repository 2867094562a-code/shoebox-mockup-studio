# Shoebox Mockup Studio

离线可用的鞋盒样机预览系统，支持标准鞋盒模型、刀模贴图、开合动画、尺寸标注、MP4/WebM 视频导出，以及 GLB/GLTF/USDZ 3D 模型导出。

## Features

- 12 个参考鞋盒模型：US / EU / UK / CN / JP / 全球运动款，均分男女款。
- 空盒结构：盒盖和底盒均为薄壳，盒内为空白纸板色。
- 整张刀模贴图模式：盒盖顶面、盒盖长边、底盒外底面、底盒长边、左右短边分区映射。
- 单图满铺模式：快速预览普通图片贴图。
- 可开关尺寸线、比例信息、结构线。
- 开盒 / 合盒动画，可导出视频。
- 3D 模型导出：GLB、GLTF、USDZ。
- 完全离线：Three.js 和导出器已本地化到 `vendor/`。

## Run Offline

双击 `start-offline.bat`，或在当前目录运行：

```bash
python -m http.server 8124 --bind 127.0.0.1
```

然后打开：

```text
http://127.0.0.1:8124/
```

## Dieline Templates

`templates/` 中包含 12 个模型的 v3 刀模模板。当前页面也可以通过“下载兼容刀模”和“下载全部刀模”生成模板。

模板分区：

- `LID TOP`: 盒盖顶面
- `LID LONG`: 盒盖长边
- `BASE OUTER BOTTOM`: 底盒外底面
- `BASE LONG`: 底盒长边
- `LEFT SHORT` / `RIGHT SHORT`: 左右短边
- `BLEED`: 出血 / 插舌参考区
