from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from full_text_search.models import Article, Inverted_index
from django.db import connection
from bs4 import BeautifulSoup
import xml.etree.ElementTree as ET
import json
import nltk
import re
from django.views.decorators.csrf import csrf_exempt
import string
import json
import urllib
ps = nltk.PorterStemmer()
nltk.download('punkt')
# Create your views here.
def keyword(request):
    if request.method == "GET":
        try:
            keyword = request.GET['keyword']
        except Exception as e:
            print(e)
            return HttpResponse("should include keyword")
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
        title_id = {}
        for result in results: 
            article_key = result[2]  
            word_key = result[0]
            if article_key in article_dic :
                article_value = article_dic[article_key]
                if word_key in article_value :
                    article_value[word_key] = str(article_value[word_key]) +"," +str(result[1])
                else :
                    article_value[word_key] = str(result[1])

            else :
                article_dic[article_key] = {}
                title_id[article_key] = result[3]
                article_dic[article_key][word_key] = str(result[1])

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
                    "article_id" : title_id[t[0]],
                }
                key += 1
                result_data.append(data)
        return JsonResponse(result_data , safe=False)
    else :
        return HttpResponse("please use GET")


def process_xml(file_name):
    tree = ET.parse('file/'+file_name)
    root = tree.getroot()
    all_article = root.findall('./PubmedArticle')
    Inverted_index.objects.all().delete()
    Article.objects.all().delete()
    print(len(all_article))
    ArticleList = []
    for article in all_article:
        abstract = article.find('./MedlineCitation/Article/Abstract/AbstractText')
        if abstract is not None :
            title = article.find('./MedlineCitation/Article/ArticleTitle')
            count_arr = articel_sentences_words_chars(abstract.text.strip())
            insert_data = Article(  name=title.text.strip(),
                                    content=abstract.text.strip(),
                                    character_conut=count_arr['char_count'],
                                    word_count = count_arr['word_count'],
                                    sentence_count = count_arr['sent_count']
                                )
            ArticleList.append(insert_data)
    Article.objects.bulk_create(ArticleList)

def process_json(file_name):
    input_file = open ('file/'+file_name)
    json_array = json.load(input_file)
    Inverted_index.objects.all().delete()
    Article.objects.all().delete()
    ArticleList = []
    print(len(json_array))
    for item in json_array :
        print("****************")
        tweet = item['tweet']
        name = item['name']
        count_arr = articel_sentences_words_chars(tweet.strip())
        insert_data = Article(  name=name,
                                content=tweet.strip(),
                                character_conut=count_arr['char_count'],
                                word_count = count_arr['word_count'],
                                sentence_count = count_arr['sent_count']
                            )
        ArticleList.append(insert_data)
    Article.objects.bulk_create(ArticleList)


def create_inverted_index():
    inverted_index_list = []
    for article in Article.objects.all():
        contents = re.sub(r'["\',();\[\]]','',article.content)
        contents = contents.strip(string.punctuation)
        contents = contents.split()
        word_index = 1
        for word in contents:
            if len(word) > 1 and word[-1] == '.' :
                word = word[0:-1]
            word = ps.stem(word)
            insert_data = Inverted_index(
                word = word,
                position = word_index,
                article_id = article.id
            )
            inverted_index_list.append(insert_data)
            word_index += 1
            if len(inverted_index_list) == 1000 :
                Inverted_index.objects.bulk_create(inverted_index_list)
                inverted_index_list=[]
    if len(inverted_index_list) != 0 :
        Inverted_index.objects.bulk_create(inverted_index_list)
            
        


def articel_sentences_words_chars(text):
    sentences = nltk.sent_tokenize(text)
    json_conut={
        'sent_count' : len(sentences),
        'char_count' : len(text.replace(" ",'')),
        'word_count' : len(text.split()),
    }
    return json_conut

def abstract_info(text):
    sentences = nltk.sent_tokenize(text)
    sent_count = len(sentences)
    token_arr = []
    for sent in sentences:
        sent = re.sub(r"[.,()]",'',sent)
        tokens = sent.split(' ')
        for token in tokens :
            token_arr.append(ps.stem(token)+" , ")
    word_count = len(token_arr)

    token_arr.append(sent_count)
    token_arr.append(" , ")
    token_arr.append(word_count)
    
    return token_arr

@csrf_exempt
def upload_file (request):
    if request.method == "POST" :
        files = request.FILES.get('file')
        f = open('file/' + files.name, 'wb+')
        for chunk in files.chunks():
                f.write(chunk)
        f.close()
        arr = files.name.split('.')
        if arr[1] == 'xml' :
            process_xml(files.name)
        elif arr[1] == 'json' :
            process_json(files.name)
        create_inverted_index()

        return HttpResponse('ok')
    else :
        return HttpResponse("please use POST")

def all_contents (request) :
    if request.method == "GET" :
        datas = list(Article.objects.values())
        return JsonResponse(datas,safe=False)

    else :
        return HttpResponse("please use GET")

def get_position(request):
    if request.method == "GET" :
        keyword = request.GET['keyword']
        keyword = urllib.parse.unquote(keyword)
        print("*******"+keyword)
        keyword = ps.stem(keyword)
        cursor = connection.cursor()
        cursor.execute("""
        SELECT a.position,a.article_id
        FROM full_text_search_inverted_index as a 
        WHERE a.word = '%s' """%(keyword))
        results = cursor.fetchall()
        result_data ={}
        for result in results:
            article_name = result[1]
            if article_name in result_data :
                result_data[article_name] = str(result_data[article_name]) + "," + str(result[0])
            else :
                result_data[article_name] = str(result[0])
        result_arr =[]
        for r in result_data.items():
            data ={
                'title' : r[0],
                'position' : r[1],
            }
            result_arr.append(data)
        return JsonResponse(result_arr,safe=False)
        return HttpResponse("please use GET")

    


