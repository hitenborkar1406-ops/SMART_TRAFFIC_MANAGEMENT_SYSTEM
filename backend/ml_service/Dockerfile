FROM python:3.12-slim
WORKDIR /srv
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
# The 300+ MB model and the CSV are mounted at run time rather than baked into the image:
#   docker run -p 8000:8000 -v $(pwd)/models:/srv/models -v $(pwd)/data:/srv/data nagpur-traffic
ENV MODEL_PATH=/srv/models/nagpur_traffic_model.pkl \
    DATA_PATH=/srv/data/nagpur_current_congestion.csv
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
