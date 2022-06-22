import cv2 as cv
from cv2 import convertScaleAbs
from cv2 import GaussianBlur
import numpy as np
from pathlib import Path
import os
import tensorflow as tf
from time import sleep
from picamera import PiCamera
import RPi.GPIO as GPIO
import time
import mysql.connector
from mysql.connector import Error
from picamera.array import PiRGBArray
GPIO.setwarnings(False)
den = 40
HN = 29
GPIO.setmode(GPIO.BOARD)
GPIO.setup(den,GPIO.OUT)
GPIO.setup(HN, GPIO.IN)  


CLASS_NAME = ['paper', 'bottle', 'can', 'other']

model = tf.keras.models.load_model('model_final.h5')
bg_path = './preprocess_img/background/'
backSub_ds = os.listdir(bg_path)
backSub = cv.createBackgroundSubtractorKNN()
background = cv.imread('./preprocess_img/image_20220618_140220.jpeg')
image = backSub.apply(background)
CLASS_NAME = ['paper', 'bottle', 'can']
for i in backSub_ds:
    file_path = bg_path + i
    img = cv.imread(file_path)
    image = backSub.apply(img)
    

def create_db_connection(host_name, user_name, user_password, db_name):
    connection = None
    try:
        connection = mysql.connector.connect(
            host=host_name,
            user=user_name,
            passwd=user_password,
            database=db_name
        )
        print("MySQL Database connection successful")
    except Error as err:
        print(f"Error: '{err}'")

    return connection

def execute_query(connection, query):
    cursor = connection.cursor(buffered=True)
    try:
        cursor.execute(query)
        connection.commit()
        print("Query successful")
        res = cursor.fetchall()
        return res

    except Error as err:
        print(f"Error: '{err}'")

def capture():
    camera = PiCamera()
    camera.iso = 120
    camera.resolution = (640, 480)
    sleep(0.5)
    print('check1')

    GPIO.output(den, GPIO.HIGH)
    camera.start_preview()
    camera.shutter_speed = 50000
    camera.exposure_mode = "backlight"
    camera.awb_mode = "off"
    camera.awb_gains = (1.9, 0.8)
    rawCapture = PiRGBArray(camera)
    sleep(0.1)
    camera.capture(rawCapture, format='bgr')
    image = rawCapture.array
    camera.stop_preview()
    GPIO.output(den, GPIO.LOW)
    camera.close()

    return image
def preprocessing(img):
    print('check2')
    cv.imshow('test', img);

    image = backSub.apply(img)
    image = GaussianBlur(image, (5, 5), sigmaX=0, sigmaY=0)
    image = cv.threshold(image, 20, 255, cv.THRESH_BINARY)[1]
    morp_kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (5, 5))

    hsv_threshold = cv.morphologyEx(
        image, cv.MORPH_CLOSE, morp_kernel, iterations=9)
    morp_kernel = cv.getStructuringElement(cv.MORPH_ELLIPSE, (3, 3))

    hsv_threshold = cv.morphologyEx(
        hsv_threshold, cv.MORPH_ERODE, morp_kernel, iterations=8)

    contours, hierarchy = cv.findContours(
        hsv_threshold, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE)
    max_area = 0
    x, y, w, h = 0, 0, 0, 0
    for cnt in contours:
        area = cv.contourArea(cnt)
        if area > max_area:
            max_area = area
            x, y, w, h = cv.boundingRect(cnt)
    cropped_img = img[y:y+h, x:x+w]
    cv.imwrite("./shared/test/t.jpeg", cropped_img)
    return cropped_img

def predict_pipeline(channel):
    conn = create_db_connection('localhost', 'tblexcelsior', 'tblexcelsior', 'Smart_Bin')
    query = "select captured from process;"
    capturing = execute_query(conn, query)[0][0]
    if (capturing == 1):
        image = capture()
        query = "update process set captured=0 where id = 1;"
        res = execute_query(conn, query)

        """processed_image = preprocessing(image)
        predict_image = cv.resize(processed_image, (224, 224), interpolation = cv.INTER_AREA)
        predict_image = np.expand_dims(predict_image, axis=0)
        predicted = model.predict(predict_image)
        query = "update process set captured=0 where id = 1;"
        res = execute_query(conn, query)
        if np.max(predicted) > 0.6:
            predicted_class = np.argmax(predicted)
            c = CLASS_NAME[predicted_class]
        else:
            c = CLASS_NAME[3]
        query = "insert into garbage_statistic(g_type, step) values ('{}', 1)".format(c)
        res = execute_query(conn, query)"""
    else:
        pass


    conn.close()

GPIO.add_event_detect(HN, GPIO.FALLING, callback=predict_pipeline)
print('check')
while(1):
    pass