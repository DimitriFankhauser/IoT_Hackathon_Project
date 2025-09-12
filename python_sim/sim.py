import random
import time
import urllib.request
import json
import math
import requests

# CO2 range in ppm // ml/m3
LOWER_INTAKE_CO2_RANGE = 800
UPPER_INTAKE_CO2_RANGE = 1500
MAX_COMPENSATION = 700
# Airflow ragne in 4 m3/min for 1000m3 room volume 
MAX_AIRFLOW = 4

CO2_DENSITY_40C = 0.001697  # g/ml at 40 degrees Celsius
CO2_DENSITY_10C = 0.001881  # g/ml at 10 degrees Celsius

data_point_url = "http://localhost:12000/npl/objects/datapoint/Datapoint/"
data_point_get_url = "http://localhost:12000/npl/objects/datapoint/Datapoint/"
auth_url = 'http://localhost:11000/realms/starter/protocol/openid-connect/token'


def CO2_INTAKE(DENSITY: float, CO2_ENVIRONMENT: int):
    """ Gaussian model for CO2 intake over the day. Returns the CO2 concentration at the outlet in g/m3."""
    return DENSITY * CO2_ENVIRONMENT


def CO2_OUTLET(DENSITY: float, CO2_ENVIRONMENT: int):
    """ Gaussian model for CO2 outlet over the day. Returns the CO2 concentration at the outlet in g/m3."""
    return DENSITY * (CO2_ENVIRONMENT - (MAX_COMPENSATION * math.exp(
        -0.2 * (-12 + (time.localtime().tm_hour + (time.localtime().tm_min / 60))) ** 2)))


def AIRFLOW():
    """ Gaussian model for airflow over the day. Returns the airflow in m3/min."""
    return MAX_AIRFLOW * math.exp(-0.2 * (-12 + (time.localtime().tm_hour + (time.localtime().tm_min / 60))) ** 2)


def DATA_PACKET():
    """ Generates a data packet with current timestamp, intake and outlet CO2 concentrations and airflow."""
    DENSITY = CO2_DENSITY_10C - ((CO2_DENSITY_10C - CO2_DENSITY_40C) * math.exp(
        -0.2 * (-12 + (time.localtime().tm_hour + (time.localtime().tm_min / 60))) ** 2))
    CO2_ENVIRONMENT = random.randint(LOWER_INTAKE_CO2_RANGE, UPPER_INTAKE_CO2_RANGE)  # CO2 in ppm at intake
    INTAKE = CO2_INTAKE(DENSITY, CO2_ENVIRONMENT)
    OUTLET = CO2_OUTLET(DENSITY, CO2_ENVIRONMENT)
    FLOW = AIRFLOW()
    PACKET = {
        "timestamp": time.time() / 60,  # in minutes
        "intake": INTAKE,
        "outlet": OUTLET,
        "airflow": FLOW,
        "@parties": {
            "owner": {
                "claims": {
                    "email": [
                        "alice@example.com"
                    ]
                }
            }
        }
    }
    return json.dumps(PACKET)


def request_token():
    headers = {
        'accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
    }
    data = {
        'grant_type': 'client_credentials',
        'client_id': 'nodered',
        'client_secret': 'NplStarter2025!',
    }
    response = requests.post(auth_url, headers=headers, data=data)

    # You can check the response status and content
    response_data = response.json()

    # Extract the access_token
    access_token = response_data.get('access_token')
    return access_token


def send_result(token):
    headers = {
        'accept': 'application/json',
        'Authorization': 'Bearer' + token
    }

    return requests.post(url=data_point_url, headers=headers, data=DATA_PACKET())


def send_http_get():
    jwt_token = request_token()
    headers = {
        'accept': 'application/json',
        'Authorization': 'Bearer' + jwt_token
    }
    response_get = requests.get(url=data_point_get_url, headers=headers)
    print(response_get.json())


def send_http_post():
    jwt_token = request_token()

    # send POST_Request
    response_POST = send_result(jwt_token)
    if response_POST.status_code != 200:
        response_POST = send_result(jwt_token)

    print(response_POST.status_code)


if __name__ == '__main__':
    while True:
        send_http_post()
        # sleep 10mins
        time.sleep(600)
