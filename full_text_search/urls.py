from django.contrib import admin
from django.urls import path
from full_text_search import views

urlpatterns = [
    path('keyword_search/',views.keyword),
    path('show_content/',views.content),
    path('muti_position/',views.muti_pos),
    path('get_contents',views.all_contents),
    path('get_position/',views.get_position),
    path('upload_file',views.upload_file),
    path('create_word_frequency_table',views.create_word_frequency_table),
    path('whole_database_frequency',views.whole_database_frequency),
    path('stem_database_frequency',views.stem_database_frequency),
    path('stem_and_origin_frequency',views.stem_and_origin_frequency),
    path('spell_check/',views.spell_check),
    path('keyword_zipf_chart/',views.keyword_zipf_chart),
    path('stem_keyword_zipf_chart/',views.stem_keyword_zipf_chart),
    path('keyword_zipf_list/',views.keyword_zipf_list),
    path('create_covid_token_frequency', views.create_covid_token_frequency),
    path('analysis_school_market_top_ten',views.analysis_school_market_top_ten),
    path('screening',views.screening),
]
