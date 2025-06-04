// DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const selectBtn = document.getElementById('selectBtn');
const uploadBtn = document.getElementById('uploadBtn');
const resetBtn = document.getElementById('resetBtn');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const fileSize = document.getElementById('fileSize');
const imagePreview = document.getElementById('imagePreview');
const previewImg = document.getElementById('previewImg');
const progressBar = document.getElementById('progressBar');
const resultsGrid = document.getElementById('resultsGrid');
const resultsCount = document.getElementById('resultsCount');
const successMessage = document.getElementById('successMessage');
const statusText = document.getElementById('statusText');
const successText = document.getElementById('successText');
const signCount = document.getElementById('signCount');

// 边界框容器
const boundingBoxes = [];

// 绑定事件
selectBtn.addEventListener('click', () => fileInput.click());
fileInput.addEventListener('change', handleFileSelect);
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
uploadBtn.addEventListener('click', uploadFile);
resetBtn.addEventListener('click', resetForm);

// 文件选择处理
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        processFile(file);
    }
}

// 拖拽处理
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        processFile(file);//调用文件处理函数
    } else {
        alert('请选择图片文件 (JPG, PNG)');
    }
}

// 处理文件
function processFile(file) {
    // 验证文件类型
    if (!file.type.match('image.*')) {
        alert('请选择图片文件 (JPG, PNG)');
        return;
    }
    
    // 验证文件大小
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > 5) {
        alert('文件大小不能超过5MB');
        return;
    }
    
    // 显示文件信息
    fileName.textContent = file.name;
    fileSize.textContent = fileSizeMB.toFixed(1) + ' MB';
    fileInfo.classList.add('active');
    statusText.textContent = '准备上传';
    
    // 预览图片
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
        imagePreview.querySelector('.placeholder').style.display = 'none';
        
        // 清除之前的边界框
        clearBoundingBoxes();
    };
    reader.readAsDataURL(file);
}

// 清除边界框
function clearBoundingBoxes() {
    boundingBoxes.forEach(box => {
        if (box.parentNode === imagePreview) {
            imagePreview.removeChild(box);
        }
    });
    boundingBoxes.length = 0;
}

// 创建边界框
function createBoundingBox(result, imgWidth, imgHeight) {
    // 计算边界框位置
    const [x1, y1, x2, y2] = result.bbox;
    const width = x2 - x1;
    const height = y2 - y1;
    
    // 创建边界框元素
    const box = document.createElement('div');
    box.className = 'bounding-box';
    box.style.left = `${x1}px`;
    box.style.top = `${y1}px`;
    box.style.width = `${width}px`;
    box.style.height = `${height}px`;
    
    // 随机颜色
    const colors = ['#4361ee', '#06d6a0', '#ef476f', '#ffd166', '#118ab2'];
    const color = colors[Math.floor(Math.random() * colors.length)];
    box.style.borderColor = color;
    
    // 创建标签
    const label = document.createElement('div');
    label.className = 'bounding-label';
    label.textContent = `${result.label} (${(result.confidence * 100).toFixed(1)}%)`;
    label.style.left = `${x1}px`;
    label.style.top = `${y1}px`;
    label.style.backgroundColor = color;
    
    // 添加鼠标事件
    box.addEventListener('mouseenter', () => {
        box.style.borderWidth = '4px';
        label.style.fontSize = '14px';
    });
    
    box.addEventListener('mouseleave', () => {
        box.style.borderWidth = '3px';
        label.style.fontSize = '12px';
    });
    
    // 添加到容器
    imagePreview.appendChild(box);
    imagePreview.appendChild(label);
    
    // 存储引用
    boundingBoxes.push(box, label);
    
    return box;
}

// 显示识别结果
function displayResults(results) {
    // 清除之前的结果
    resultsGrid.innerHTML = '';
    resultsCount.textContent = `${results.length} 个`;
    signCount.textContent = results.length;
    
    // 添加新结果
    results.forEach((result, index) => {
        const resultCard = document.createElement('div');
        resultCard.className = 'result-card';
        resultCard.innerHTML = `
            <div class="result-header">
                <div class="sign-label">${result.label}</div>
                <div class="confidence">${(result.confidence * 100).toFixed(1)}%</div>
            </div>
            <div class="sign-description">${result.description}</div>
            <div class="coordinates">
                <div class="coord">x1: ${result.bbox[0]}</div>
                <div class="coord">y1: ${result.bbox[1]}</div>
                <div class="coord">x2: ${result.bbox[2]}</div>
                <div class="coord">y2: ${result.bbox[3]}</div>
            </div>
        `;
        
        // 添加点击事件高亮边界框
        resultCard.addEventListener('click', () => {
            // 高亮当前卡片
            document.querySelectorAll('.result-card').forEach(card => {
                card.classList.remove('active');
            });
            resultCard.classList.add('active');
            
            // 高亮对应的边界框
            boundingBoxes.forEach(box => {
                box.style.opacity = '0.5';
            });
            
            // 当前边界框高亮
            if (boundingBoxes[index * 2]) {
                boundingBoxes[index * 2].style.opacity = '1';
                boundingBoxes[index * 2].style.borderWidth = '4px';
            }
        });
        
        resultsGrid.appendChild(resultCard);
    });
    
    // 显示成功消息
    successMessage.style.display = 'block';
}

/*
// 手动模拟文件上传
function uploadFile() {
    if (!fileInput.files.length) {
        alert('请先选择图片文件');
        return;
    }
    
    // 清除之前的边界框
    clearBoundingBoxes();
    
    // 显示上传进度
    progressBar.style.width = '0%';
    statusText.textContent = '识别中...';
    successMessage.style.display = 'none';
    
    // 模拟上传和识别过程
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 10;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // 模拟识别完成
            setTimeout(() => {
                // 模拟后端返回的数据
                const mockResults = [
                    {
                        "label": "PIL001EQ",
                        "description": "停止标志",
                        "confidence": 0.98,
                        "bbox": [50, 30, 200, 180]
                    },
                    {
                        "label": "PIL101IEQ",
                        "description": "限速60公里/小时",
                        "confidence": 0.92,
                        "bbox": [250, 80, 400, 200]
                    },
                    {
                        "label": "PIL107IEQ",
                        "description": "环岛行驶",
                        "confidence": 0.95,
                        "bbox": [180, 220, 350, 350]
                    }
                ];
                
                // 获取图片尺寸
                const imgWidth = previewImg.naturalWidth || 600;
                const imgHeight = previewImg.naturalHeight || 400;
                
                // 创建边界框
                mockResults.forEach(result => {
                    createBoundingBox(result, imgWidth, imgHeight);
                });
                
                // 显示结果
                displayResults(mockResults);
                
                statusText.textContent = '识别完成';
            }, 500);
        }
        
        progressBar.style.width = `${progress}%`;
    }, 200);
}
*/

//调用API进行文件上传
function uploadFile() {
    if (!fileInput.files.length) {
        alert('请先选择图片文件');
        return;
    }

    clearBoundingBoxes();
    progressBar.style.width = '0%';
    statusText.textContent = '识别中...';
    successMessage.style.display = 'none';

    const file = fileInput.files[0];
    const formData = new FormData();
    formData.append('file', file);

    // 发送POST请求到后端
    fetch('http://localhost:5000/api/detect', {//发送 POST 请求到指定 URL
        method: 'POST',
        body: formData
    })
    .then(response => response.json())//当请求完成，传入的response 参数包含服务器响应，.json将响应解析为JSON格式
    .then(data => {
        // 当 JSON 解析完成，data 参数包含解析后的数据
        const imgWidth = previewImg.naturalWidth || 600;
        const imgHeight = previewImg.naturalHeight || 400;
        clearBoundingBoxes();
        data.forEach(result => {
            createBoundingBox(result, imgWidth, imgHeight);
        });
        displayResults(data);
        statusText.textContent = '识别完成';
        progressBar.style.width = '100%';
    })
    .catch(error => {
        statusText.textContent = '识别失败';
        alert('识别失败: ' + error);
    });
}



// 重置表单
function resetForm() {
    fileInput.value = '';
    fileInfo.classList.remove('active');
    previewImg.style.display = 'none';
    imagePreview.querySelector('.placeholder').style.display = 'block';
    successMessage.style.display = 'none';
    progressBar.style.width = '0%';
    statusText.textContent = '等待上传';
    
    // 清除结果和边界框
    resultsGrid.innerHTML = '';
    resultsCount.textContent = '0 个';
    clearBoundingBoxes();
}

// 初始化示例
function initDemo() {
    fileName.textContent = 'traffic_signs_sample.jpg';
    fileSize.textContent = '2.1 MB';
    fileInfo.classList.add('active');
    previewImg.src = 'https://images.unsplash.com/photo-1610494940235-0ec2106d4b4a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
    previewImg.style.display = 'block';
    imagePreview.querySelector('.placeholder').style.display = 'none';
    
    // 加载后显示边界框
    previewImg.onload = function() {
        // 模拟后端返回的数据
        const mockResults = [
            {
                "label": "PIL001EQ",
                "description": "停止标志",
                "confidence": 0.98,
                "bbox": [50, 30, 200, 180]
            },
            {
                "label": "PIL101IEQ",
                "description": "限速60公里/小时",
                "confidence": 0.92,
                "bbox": [250, 80, 400, 200]
            },
            {
                "label": "PIL107IEQ",
                "description": "环岛行驶",
                "confidence": 0.95,
                "bbox": [180, 220, 350, 350]
            }
        ];
        
        // 获取图片尺寸
        const imgWidth = previewImg.naturalWidth || 600;
        const imgHeight = previewImg.naturalHeight || 400;
        
        // 创建边界框
        mockResults.forEach(result => {
            createBoundingBox(result, imgWidth, imgHeight);
        });
        
        // 显示结果
        displayResults(mockResults);
    };
}

// 初始化页面
initDemo();