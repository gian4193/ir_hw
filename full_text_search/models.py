from django.db import models 

# Create your models here.

class Article(models.Model):
    name = models.CharField(max_length=100,unique=True)
    content = models.CharField(max_length=1000)
    character_conut = models.IntegerField(null=True)
    word_count = models.IntegerField(null=True)
    sentence_count = models.IntegerField(null=True)
    

    def __str__(self):
        return self.name

class Inverted_index(models.Model):
    word = models.CharField(max_length=50)
    position = models.IntegerField()
    article = models.ForeignKey(Article,on_delete=models.CASCADE,null=True)

    
    
    def __str__(self):
        return self.word
    
    class Ｍeta :
        ordering = ['word','article','position',]

# class Inverted_index_manager(models.Manager):

#     def get_search_result(self,keyword):
#         cursor = connection.cursor()
#         result = cursor.execute("""
#             SELECT a.word,a.position,b.name
#             FROM full_text_search_inverted_index as a
#             INNER JOIN full_text_search_article as b
#             WHERE a.word LIKE ? AND a.article_id = b.id
#             ORDER BY a.word ASC 
#         """, (keyword+'%'))
#         return result
