FROM python:3.14
WORKDIR /app
COPY db-service.py /app/
RUN pip install requests
CMD ["python", "db-service.py"]