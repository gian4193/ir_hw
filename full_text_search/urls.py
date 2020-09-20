from django.contrib import admin
from django.urls import path
from full_text_search import views

urlpatterns = [
    path('keyword_search/',views.keyword),
    path('show_content/',views.content),
    path('muti_position/',views.muti_pos),
    path('get_contents',views.all_contents),
    path('get_position/',views.get_position),
    path('upload_file',views.upload_file)
]
