import multiprocessing
import os
from ultralytics import YOLO

if __name__ == '__main__':
    # 1. 多进程初始化
    multiprocessing.set_start_method('spawn', force=True)

    yaml_path = r'E:\计算机视觉\611\pythonProject3\dataset\tt100k_yolo\tt100k.yaml'


    # 3. 启动训练
    yolo = YOLO('runs/detect/train/weights/last.pt')  #如果要重新训练就用官方预训练好的yolo11n.pt，继续训练就last和best选一个
    yolo.train(
        data=yaml_path,
        epochs=1,
        imgsz=640,
        batch=16,
        device=0,
        amp=True,
        cache="disk",
        exist_ok=True
    )