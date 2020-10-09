from django.db import models 

# Create your models here.


class Article(models.Model):
    name = models.CharField(max_length=100)
    content = models.CharField(max_length=1000)
    character_conut = models.IntegerField(null=True)
    word_count = models.IntegerField(null=True)
    sentence_count = models.IntegerField(null=True)
    

    def __str__(self):
        return self.name

class Inverted_index(models.Model):
    word = models.CharField(max_length=50)   # stem_word
    position = models.IntegerField()
    article = models.ForeignKey(Article,on_delete=models.CASCADE,null=True)

    def __str__(self):
        return self.word
    
    class Ｍeta :
        ordering = ['word','article','position',]


class Covid_article(models.Model):
    title = models.CharField(max_length=100)
    content = models.CharField(max_length=1000)

class Word_frequency(models.Model):
    article = models.IntegerField()
    word = models.CharField(max_length=50)
    occurrence = models.IntegerField()

class Stem_frequency(models.Model):
    article = models.IntegerField()
    word = models.CharField(max_length=50)
    occurrence = models.IntegerField()







