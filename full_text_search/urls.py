from django.contrib import admin
from django.urls import path
from full_text_search import views

urlpatterns = [
    path('keyword_search/',views.keyword),
]
