from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # 允许跨域请求

@app.route('/api/detect', methods=['POST'])
def detect():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    # 图片识别逻辑
    # 假设返回的结果格式如下
    results = [
        {
            "label": "PIL001EQ",
            "description": "停止标志",
            "confidence": 0.98,
            "bbox": [50, 30, 200, 180]
        },
        # ... 其他识别结果
    ]
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)