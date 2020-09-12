from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from full_text_search.models import Article, Inverted_index
from django.db import connection
import json
# Create your views here.
def keyword(request):
    if request.method == "GET":
        try:
            keyword = request.GET['keyword']
        except Exception as e:
            print(e)
            return HttpResponse("should include keyword")
        #context_info = Inverted_index.objects.filter(word__contains=str(keyword).lower())
        # article_list = []
        # for index in range(0,len(context_info)):
        #     index= int(index)
        #     article = Article.objects.filter(id = context_info[index].article_id)
        #     data={
        #         "article" : context_info[index].article_id,
        #         "position" : context_info[index].position,
        #         "title" : article[0].name.strip(),
        #     }
        #     article_list.append(data)
        cursor = connection.cursor()
        cursor.execute("""
        SELECT a.word,a.position,b.name,b.id 
        FROM full_text_search_inverted_index as a 
        INNER JOIN full_text_search_article as b 
        WHERE a.word LIKE '%s' AND a.article_id = b.id 
        ORDER BY a.word ASC """%(keyword+'%'))
        results = cursor.fetchall()
        column_name = ['word','position','title','article_id']
        result_data=[]
        for result in results:
            result_data.append(dict(zip(column_name,result)))
        return JsonResponse(result_data,safe=False)
    else :
        return HttpResponse("please use GET")

def content(request):
    if request.method == "GET":
        try:
            article = request.GET['id']
        except Exception as e:
            print(e)
            return HttpResponse("should include keyword")
        content_data = Article.objects.filter(id = int(article))
        result = {'content' : content_data[0].content.strip(),}
        return JsonResponse(result)
    else :
        return HttpResponse("please use GET")

