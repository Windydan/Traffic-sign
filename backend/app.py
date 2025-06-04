from flask import Flask, request, jsonify
from flask_cors import CORS
from ultralytics import YOLO

app = Flask(__name__)
CORS(app)  # 允许跨域请求

yolo = YOLO('runs/detect/train/weights/best.pt')

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
        class_names = [yolo.names[int(cls)] for cls in classes]
        for (box, score, class_name) in zip(boxes, scores, class_names):
            detections.append({
                "label": class_name,  # 例如 “PIL001EQ”
                "description": "交通标志描述（可自定义）",  # 可自定义或从字典映射
                "confidence": float(score),
                "bbox": [int(x) for x in box]  # 转为整数，前端需要
            })
    

    #返回JSON格式的识别结果
    return jsonify(detections)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)