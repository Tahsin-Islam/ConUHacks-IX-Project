import csv
import json

def csv_to_json(csv_file, json_file):
    with open(csv_file, mode='r') as file:
        csv_reader = csv.DictReader(file)
        data = []
        
        for row in csv_reader:
            data.append({
                "stop_id": row["stop_id"],
                "stop_code": row["stop_code"],
                "stop_name": row["stop_name"],
                "stop_lat": row["stop_lat"],
                "stop_lon": row["stop_lon"],
                "stop_url": row["stop_url"],
                "location_type": row["location_type"],
                "parent_station": row["parent_station"],
                "wheelchair_boarding": row["wheelchair_boarding"]
            })
        
    with open(json_file, mode='w') as json_f:
        json.dump(data, json_f, indent=4)

csv_file = 'stops.txt'  
json_file = 'stops.json'  

csv_to_json(csv_file, json_file)
