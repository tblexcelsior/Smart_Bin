#include <stdio.h>
#include <wiringPi.h>
#include <mysql.h>
#include <stdlib.h>
#include <string.h>

#define DIR_PIN 7	  // 7
#define STEP_PIN 5	  // 18
#define ENABLED_PIN 6 // 22
#define SWITCH 23
#define HN_PIN 21

#define SERVO_PIN 1
#define TRIGGER5 28
#define ECHO5 25

#define DEN 29

MYSQL *conn;
MYSQL_RES *res;
MYSQL_ROW row;

char *server = "127.0.0.1";
char *user = "pi";
char *password = "raspberry";
char *database = "Smart_Bin";
char cmd[200];

// Low sang ben phai
// High sang ben trai

int get_pos()
{

	int step, updated;
	while (1)
	{
		sprintf(cmd, "select g_type, step as updated from garbage_statistic where id = (select max(id) from garbage_statistic);");
		mysql_query(conn, cmd);
		res = mysql_store_result(conn);
		row = mysql_fetch_row(res);
		updated = atoi(row[1]);
		if (updated == 1)
		{
			if (strcmp(row[0], "paper") == 0)
			{
				step = 1740;
			}
			else if (strcmp(row[0], "bottle") == 0)
			{
				step = 900;
			}
			else if (strcmp(row[0], "can") == 0)
			{
				step = 70;
			}
			else if (strcmp(row[0], "other") == 0)
			{
				step = 1000;
			}
			sprintf(cmd, "update garbage_statistic set step = 0 where id = (select max(id) from garbage_statistic);");
			mysql_query(conn, cmd);
			break;
		}
		else
		{
			continue;
		}
		mysql_free_result(res);
	}
	return step;
}

void run_motor(int pos, int dir, unsigned int howLong)
{
	digitalWrite(DIR_PIN, dir);
	digitalWrite(ENABLED_PIN, LOW);
	for (int i = 0; i < pos; i++)
	{
		digitalWrite(STEP_PIN, 1);
		delayMicroseconds(howLong);
		digitalWrite(STEP_PIN, 0);
		delayMicroseconds(howLong);
	}
}

void to_camera()
{
	digitalWrite(DIR_PIN, LOW);
	digitalWrite(ENABLED_PIN, LOW);
	run_motor(50, 0, 1100);
	run_motor(50, 0, 850);
	while (digitalRead(HN_PIN) == 1)
	{
		digitalWrite(STEP_PIN, 1);
		delayMicroseconds(600);
		digitalWrite(STEP_PIN, 0);
		delayMicroseconds(600);
	}
	digitalWrite(ENABLED_PIN, HIGH);
}

void to_bin(int bin_pos, int dir)
{
	digitalWrite(ENABLED_PIN, 0);
	run_motor(50, dir, 800);
	run_motor(50, dir, 700);
	run_motor(bin_pos - 100, dir, 600);
	digitalWrite(ENABLED_PIN, 1);
}
void full_path(int bin_pos)
{
	int forward_dir;
	int back_dir;
	int back_pos;
	if (bin_pos == 1740 || bin_pos == 900)
	{
		forward_dir = 1;
		back_dir = 0;
		back_pos = bin_pos - 900;
	}
	else if (bin_pos == 70 || bin_pos == 1000)
	{
		forward_dir = 0;
		back_pos = bin_pos + 900;
		back_dir = 1;
	}

	to_bin(bin_pos, forward_dir);
	delay(500);
	pwmWrite(SERVO_PIN, 100);
	delay(1500);
	pwmWrite(SERVO_PIN, 35);
	delay(500);
	if (bin_pos != 900)
	{
		to_bin(back_pos, back_dir);
	}
}

float getDistance(int trigPin, int echoPin)
{
	// unsigned int timeout_test=0;
	unsigned int endTime = 0;
	unsigned int startTime = 0;
	unsigned int duration = 0;

	float distanceCm;
	digitalWrite(trigPin, LOW);
	delayMicroseconds(200);
	digitalWrite(trigPin, HIGH);
	delayMicroseconds(10);
	digitalWrite(trigPin, LOW);
	// timeout_test = micros();
	while (digitalRead(echoPin) == 0)
	{
		startTime = micros();
		/*if (startTime - timeout_test > TIMEOUT){
			break;
		}*/
	}

	// timeout_test = micros();
	while (digitalRead(echoPin) == 1)
	{

		endTime = micros();
		/*if (endTime - timeout_test > TIMEOUT){
			break;
		}*/
	}

	duration = endTime - startTime;

	// convert to distance
	distanceCm = (duration / 29.1) / 2;

	return distanceCm;
}

void main_process(void)
{
	float trash_in;
	int pos;
	// sprintf(cmd, "update process set captured=1, processing=1 where id=1;");
	// mysql_query(conn, cmd);
	while (1)
	{
		delay(500);
		trash_in = getDistance(TRIGGER5, ECHO5);
		// printf("%f\n", trash_in);

		if (trash_in < 25)
		{
			sprintf(cmd, "update process set captured=1, processing=1 where id=1;");
			mysql_query(conn, cmd);
			delay(100);
			to_camera();
			delay(300);
			digitalWrite(DEN, HIGH);
			delay(2000);
			digitalWrite(DEN, LOW);
			delay(6000);
			pos = get_pos();
			full_path(pos);
			sprintf(cmd, "update process set processing=0 where id=1;");
			mysql_query(conn, cmd);
			break;
		}
	}
}
int main()
{
	wiringPiSetup();

	conn = mysql_init(NULL);
	mysql_real_connect(conn, server, user, password, database, 0, NULL, 0);
	pinMode(DEN, OUTPUT);

	// stepper motor
	pinMode(STEP_PIN, OUTPUT);
	pinMode(DIR_PIN, OUTPUT);
	pinMode(ENABLED_PIN, OUTPUT);
	// Limit switch
	pinMode(HN_PIN, INPUT);
	pullUpDnControl(SWITCH, PUD_DOWN);
	pinMode(SWITCH, INPUT);
	pinMode(TRIGGER5, OUTPUT);
	pinMode(ECHO5, INPUT);

	// Servo
	pinMode(SERVO_PIN, PWM_OUTPUT);
	pwmSetMode(PWM_MODE_MS);
	pwmSetClock(192);
	pwmSetRange(2000);
	digitalWrite(ENABLED_PIN, LOW);
	int sig;
	while (1)
	{
		pass
	}
}
// Main interrupt
wiringPiISR(SWITCH, INT_EDGE_FALLING, &main_process)
