from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO
import yaml

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 加载YOLO模型
yolo = YOLO('runs/detect/train/weights/last.pt')

# 加载类别名称映射
with open('dataset/tt100k_yolo/tt100k.yaml', 'r', encoding='utf-8') as f:
    yaml_data = yaml.safe_load(f)
    class_names = yaml_data['names']

@app.route('/api/detect', methods=['POST'])
def detect():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    # 图片识别逻辑
    # 将上传的图片保存到临时文件（或直接使用内存流）
    import tempfile
    with tempfile.NamedTemporaryFile(suffix='.jpg', delete=False) as tmp:
        file.save(tmp.name)
        img_path = tmp.name

    # 调用 YOLO 模型进行推理
    results = yolo.predict(img_path)

    # 解析 YOLO 返回的结果，转换为前端需要的格式
    detections = []
    for result in results:
        boxes = result.boxes.xyxy.cpu().numpy()  # 边界框坐标
        scores = result.boxes.conf.cpu().numpy()  # 置信度
        classes = result.boxes.cls.cpu().numpy()  # 类别索引
        for (box, score, cls) in zip(boxes, scores, classes):
            class_id = int(cls)
            class_name = yolo.names[class_id]
            description = class_names.get(class_id, class_name)
            detections.append({
                "label": class_name,
                "description": description,
                "confidence": float(score),
                "bbox": [int(x) for x in box]
            })
    

    #返回JSON格式的识别结果
    return jsonify(detections)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)