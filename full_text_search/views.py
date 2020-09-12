from django.shortcuts import render
from django.http import HttpResponse,JsonResponse
from full_text_search.models import Article, Inverted_index
# Create your views here.
def keyword(request):
    if request.method == "GET":
        try:
            keyword = request.GET['keyword']
        except Exception as e:
            print(e)
            return HttpResponse("should include keyword")
        context_info = Inverted_index.objects.filter(word__contains=str(keyword).lower())
        article_list = []
        for index in range(0,len(context_info)):
            index= int(index)
            # article = Inverted_index.objects.select_related('article').get(id=index)
            data={
                "article" : context_info[index].article_id,
                "position" : context_info[index].position,
                # "title" : article.name,
            }
            article_list.append(data)
        return JsonResponse({"article_list": article_list})
    else :
        return HttpResponse("please use GET")
