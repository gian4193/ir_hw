from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from full_text_search.models import Article, Inverted_index ,Covid_article, Word_frequency, Stem_frequency,whole_covid_token_frequency,stem_whole_covid_token_frequency
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
import numpy as np
from spellchecker import SpellChecker
from django.db.models import Q
from functools import reduce

nltk.download('stopwords')
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
        abstract_text=''
        abstracts = article.findall('./MedlineCitation/Article/Abstract/AbstractText')
        if len(abstracts) != 0 :
            title = article.find('./MedlineCitation/Article/ArticleTitle')
            for index in range(0,len(abstracts)):
                if abstracts[index].attrib.get("Label") is not None :
                    if index == 0 :
                        abstract_text = abstract_text + '<font-color>'+abstracts[index].attrib["Label"]+" :"+'</font-color> ' + abstracts[index].text.strip()+" "
                    else :
                        abstract_text = abstract_text + ' <font-color>'+abstracts[index].attrib["Label"]+" :"+'</font-color> ' + abstracts[index].text.strip()+" "
                else :
                    abstract_text = abstract_text +  abstracts[index].text.strip()+ " "
            count_arr = articel_sentences_words_chars(abstract_text.strip())
            insert_data = Article(  name=title.text.strip(),
                                    content=abstract_text,
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
        tweet = item['tweet_text']
        name = item['username']
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
    text = text.replace("<font-color>"," ")
    text = text.replace("</font-color>",' ')
    sentences = nltk.sent_tokenize(text)
    word = 0
    for i in sentences:
        word = word+len([w for w in nltk.word_tokenize(i) if w not in string.punctuation])
        print([w for w in nltk.word_tokenize(i) if w not in string.punctuation])
    json_conut={
        'sent_count' : len(sentences),
        'char_count' : len(text.replace(" ",'')),
        'word_count' : word,
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



def create_word_frequency_table(request):
    nltk_stopwords = nltk.corpus.stopwords.words('english')
    for i in string.punctuation :
        nltk_stopwords.append(i)
    print(nltk_stopwords)

    if request.method == "GET" :
        datas = Covid_article.objects.values()
        for data in datas :
            sentences = nltk.sent_tokenize(data['content'])
            token_arr = []
            stem_arr = []
            for i in sentences:
                for w in nltk.word_tokenize(i) :
                    w = w.lower()
                    if w not in nltk_stopwords :
                        token_arr.append(w)
                        stem_arr.append(ps.stem(w))
            token_arr = np.asarray(token_arr)
            stem_arr = np.asarray(stem_arr)
            unique, counts = np.unique(token_arr, return_counts=True)
            stem_unique, stem_counts = np.unique(stem_arr, return_counts=True)
            insert_list=[]
            for j in range(0,len(unique)) :
                insert_data = Word_frequency(
                    word = unique[j],
                    occurrence = counts[j],
                    article = data['id']
                )
                insert_list.append(insert_data)
                if len(insert_list) == 1000 :
                    Word_frequency.objects.bulk_create(insert_list)
                    insert_list=[]
            if len(insert_list) != 0 :
                Word_frequency.objects.bulk_create(insert_list)


            stem_insert_list=[]
            for j in range(0,len(stem_unique)) :
                insert_data = Stem_frequency(
                    word = stem_unique[j],
                    occurrence = stem_counts[j],
                    article = data['id']
                )
                stem_insert_list.append(insert_data)
                if len(stem_insert_list) == 1000 :
                    Stem_frequency.objects.bulk_create(stem_insert_list)
                    stem_insert_list=[]
            if len(stem_insert_list) != 0 :
                Stem_frequency.objects.bulk_create(stem_insert_list)

    
        return HttpResponse("success")

    else :
        return HttpResponse("please use GET")

def whole_database_frequency(request):
    if request.method == "GET" :
        datas = list(whole_covid_token_frequency.objects.values())
        return JsonResponse(datas,safe=False)

    else :
        return HttpResponse("please use GET")


def create_covid_token_frequency(request):
    if request.method == "GET" :
        datas = Word_frequency.objects.values()
        data_dict = {}
        for data in datas :
            if data['word'] in data_dict :
                data_dict[data['word']] = data_dict[data['word']] + data['occurrence']
            else:
                data_dict[data['word']] = data['occurrence']

        data_dict = {k: v for k, v in sorted(data_dict.items(), key=lambda item: item[1],reverse=True)}
        frequency_arr=[]
        index = 0
        for key in data_dict :
            frequency_data = whole_covid_token_frequency( 
                index = index,
                word = key,
                number = data_dict[key])
            
            index += 1
            frequency_arr.append(frequency_data)
            if len(frequency_arr) == 1000 :
                    whole_covid_token_frequency.objects.bulk_create(frequency_arr)
                    frequency_arr=[]
        if len(frequency_arr) != 0 :
            whole_covid_token_frequency.objects.bulk_create(frequency_arr)


        
        datas = Stem_frequency.objects.values()
        data_dict = {}
        for data in datas :
            if data['word'] in data_dict :
                data_dict[data['word']] = data_dict[data['word']] + data['occurrence']
            else:
                data_dict[data['word']] = data['occurrence']

        data_dict = {k: v for k, v in sorted(data_dict.items(), key=lambda item: item[1],reverse=True)}
        frequency_arr=[]
        index = 0
        for key in data_dict :
            frequency_data = stem_whole_covid_token_frequency(
                index = index,
                word = key,
                number = data_dict[key],
            )
            index += 1
            frequency_arr.append(frequency_data)
            if len(frequency_arr) == 1000 :
                    stem_whole_covid_token_frequency.objects.bulk_create(frequency_arr)
                    frequency_arr=[]
        if len(frequency_arr) != 0 :
            stem_whole_covid_token_frequency.objects.bulk_create(frequency_arr)





    
        return HttpResponse("success")

    else :
        return HttpResponse("please use GET")


def stem_database_frequency(request):
    if request.method == "GET" :
        datas = list(stem_whole_covid_token_frequency.objects.values())
        return JsonResponse(datas,safe=False)

    else :
        return HttpResponse("please use GET")

def stem_and_origin_frequency(request):
    if request.method == "GET" :
        #stem_data
        datas = Stem_frequency.objects.values()
        stem_data_dict = {}
        for data in datas :
            if data['word'] in stem_data_dict :
                stem_data_dict[data['word']] = stem_data_dict[data['word']] + data['occurrence']
            else:
                stem_data_dict[data['word']] = data['occurrence']

        stem_data_dict = {k: v for k, v in sorted(stem_data_dict.items(), key=lambda item: item[1],reverse=True)}

        #origin_data
        datas = Word_frequency.objects.values()
        data_dict = {}
        for data in datas :
            if data['word'] in data_dict :
                data_dict[data['word']] = data_dict[data['word']] + data['occurrence']
            else:
                data_dict[data['word']] = data['occurrence']

        data_dict = {k: v for k, v in sorted(data_dict.items(), key=lambda item: item[1],reverse=True)}


        frequency_arr=[]
        index = 0
        for key in data_dict :
            insert_data ={
                "index" : index,
                "word" : key,
                "number" : data_dict[key],
            }
            index+=1
            frequency_arr.append(insert_data)
        
        index = 0
        for key in stem_data_dict :
            frequency_arr[index]['stem_word'] = key
            frequency_arr[index]['stem_number'] = stem_data_dict[key]
            index +=1
        for i in range(index,len(frequency_arr)):
            frequency_arr[i]['stem_word'] =''
            frequency_arr[i]['stem_number'] = 0
        return JsonResponse(frequency_arr,safe=False)

    else :
        return HttpResponse("please use GET")


def spell_check(request):
    if request.method == "GET" :
        datas = [ w['word'] for w in list(Word_frequency.objects.values('word')) ]
        spell = SpellChecker()
        spell.word_frequency.load_words(datas)
        target_word = request.GET['word']
        misspelled = spell.unknown([target_word])
        if len(misspelled) != 0 :
           target_word = spell.correction(target_word)
        arr =[]
        arr.append({"word" : target_word})
        return JsonResponse(arr,safe=False)
    else:
        return  HttpResponse("please use GET")

def keyword_zipf_chart(request):
    if request.method == "GET" :
        target_word = request.GET['word']
        word = ps.stem(target_word)

        article_list = [ s['article'] for s in list(Stem_frequency.objects.filter(word=word).values('article'))]
        datas = Word_frequency.objects.filter(reduce(lambda x, y: x | y, [Q(article=item) for item in article_list])).values()
        stem_data_dict = {}
        for data in datas :
            if data['word'] in stem_data_dict :
                stem_data_dict[data['word']] = stem_data_dict[data['word']] + data['occurrence']
            else:
                stem_data_dict[data['word']] = data['occurrence']

        stem_data_dict = {k: v for k, v in sorted(stem_data_dict.items(), key=lambda item: item[1],reverse=True)}
        frequency_arr=[]
        index = 0
        for key in stem_data_dict :
            whole_database_number = whole_covid_token_frequency.objects.filter(word= key)
            insert_data ={
                "index" : index,
                "word" : key,
                "number" : stem_data_dict[key],
                "whole" : whole_database_number[0].number,
                "rank" : whole_database_number[0].index,
            }
            print(insert_data)
            index+=1
            frequency_arr.append(insert_data)
        return JsonResponse(frequency_arr,safe=False)
    else:
        return  HttpResponse("please use GET")



def stem_keyword_zipf_chart(request):
    if request.method == "GET" :
        target_word = request.GET['word']
        word = ps.stem(target_word)

        article_list = [ s['article'] for s in list(Stem_frequency.objects.filter(word=word).values('article'))]
        datas = Stem_frequency.objects.filter(reduce(lambda x, y: x | y, [Q(article=item) for item in article_list])).values()
        stem_data_dict = {}
        for data in datas :
            if data['word'] in stem_data_dict :
                stem_data_dict[data['word']] = stem_data_dict[data['word']] + data['occurrence']
            else:
                stem_data_dict[data['word']] = data['occurrence']

        stem_data_dict = {k: v for k, v in sorted(stem_data_dict.items(), key=lambda item: item[1],reverse=True)}
        frequency_arr=[]
        index = 0
        for key in stem_data_dict :
            whole_database_number = stem_whole_covid_token_frequency.objects.filter(word= key)
            insert_data ={
                "index" : index,
                "word" : key,
                "number" : stem_data_dict[key],
                "whole" : whole_database_number[0].number,
                "rank" : whole_database_number[0].index,
            }
            print(insert_data)
            index+=1
            frequency_arr.append(insert_data)
        return JsonResponse(frequency_arr,safe=False)
    else:
        return  HttpResponse("please use GET")



def keyword_zipf_list(request):
    if request.method == "GET" :
        target_word = request.GET['word']
        word = ps.stem(target_word)
        article_list = [ s['article'] for s in list(Stem_frequency.objects.filter(word=word).values('article'))]
        articles =[]
        for article in article_list :
            data = Covid_article.objects.filter(id=article)
            content = data[0].content.replace(target_word,'<yellow-block>'+target_word+'</yellow-block>')
            insert_data = {
                "title" : data[0].title,
                "content" : content
            }
            articles.append(insert_data)
        return JsonResponse(articles,safe=False)
    else:
        return  HttpResponse("please use GET")


