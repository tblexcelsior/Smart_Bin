import RPi.GPIO as GPIO
import mysql.connector
from mysql.connector import Error
import time

#GPIO Mode (BOARD / BCM)
GPIO.setmode(GPIO.BOARD)
GPIO.setwarnings(False)

GPIO_switch = 33 # 33

GPIO.setup(GPIO_switch, GPIO.IN, pull_up_down=GPIO.PUD_DOWN)
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
    cursor = connection.cursor()
    try:
        cursor.execute(query)
        connection.commit()
        print("Query successful")
    except Error as err:
        print(f"Error: '{err}'")

    
def update_data(channel):
    conn = create_db_connection('localhost', 'quan', 'quandao', 'Smart_Bin')
    query = "Update process set processing = 1, captured = 1 where id = 1;"
    execute_query(conn, query)
    conn.close()
        

if __name__ == '__main__':
    GPIO.add_event_detect(GPIO_switch, GPIO.RISING, callback=update_data)  
    while (1):
    #    if GPIO.input(GPIO_switch) == 1:
    #        print("open")
    #    else: print("close")
    #    time.sleep(0.5)
        pass

