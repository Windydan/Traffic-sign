from ultralytics import YOLO


img_path = 'dataset/tt100k_yolo/images/73.jpg'
yolo = YOLO('runs/detect/train/weights/last.pt') #看你要用best or last
yolo(img_path ,show = True,save = True)

results = yolo.predict(img_path)

for result in results:
    boxes = result.boxes.xyxy
    scores = result.boxes.conf
    classes = result.boxes.cls
    class_names = [yolo.names[int(cls)] for cls in  classes]
    for box ,  score , class_ , class_name in zip(boxes, scores, classes, class_names):
        print (f" name: {class_name}, class: {class_}, confidence: {scores}, box: {boxes},")
