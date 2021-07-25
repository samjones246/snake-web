FROM python

WORKDIR /usr/src/app
COPY . .
RUN python -m pip install -r requirements.txt
RUN python -m pip install gunicorn
RUN python manage.py migrate
CMD ["gunicorn", "--bind=0.0.0.0", "--workers=3", "back.wsgi"]