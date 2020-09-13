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
        SELECT a.word,a.position,b.name,b.id,a.id
        FROM full_text_search_inverted_index as a 
        INNER JOIN full_text_search_article as b 
        WHERE a.word LIKE '%s' AND a.article_id = b.id 
        ORDER BY a.word ASC """%(keyword+'%'))
        results = cursor.fetchall()
        column_name = ['word','position','title','article_id','key']
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


def muti_pos(request) :
    if request.method == "GET":
        try:
            keyword = request.GET['keyword']
        except Exception as e:
            print(e)
            return HttpResponse("should include keyword")
        cursor = connection.cursor()
        cursor.execute("""
        SELECT a.word,a.position,b.name,b.id ,a.id
        FROM full_text_search_inverted_index as a 
        INNER JOIN full_text_search_article as b 
        WHERE a.word LIKE '%s' AND a.article_id = b.id 
        ORDER BY a.word ASC """%(keyword+'%'))
        results = cursor.fetchall()

        result_data=[]
        article_dic ={} #{title : {word : position }}  #相同title word 的資料放一起
        for result in results: 
            article_key = result[2]  
            word_key = result[0]
            if article_key in article_dic :
                article_value = article_dic[article_key]
                if word_key in article_value :
                    article_value[word_key] = str(article_value[word_key]) +"," +str(result[1])
                else :
                    article_value[word_key] = result[1]

            else :
                article_dic[article_key] = {}
                article_dic[article_key][word_key] = result[1]

        key = 1
        for t in article_dic.items():
            print("key:")
            print(t[0])
            for v in t[1].items():
                data = {
                    "word" : v[0],
                    "position" : v[1],
                    "title" : t[0],
                    "key" : key,
                }
                key += 1
                result_data.append(data)
        return JsonResponse(result_data , safe=False)
    else :
        return HttpResponse("please use GET")
    


