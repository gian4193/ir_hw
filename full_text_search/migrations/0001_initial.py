# Generated by Django 3.1.1 on 2020-09-11 08:11

from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='Article',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100)),
                ('content', models.CharField(max_length=1000)),
                ('character_conut', models.IntegerField(null=True)),
                ('word_count', models.IntegerField(null=True)),
                ('sentence_count', models.IntegerField(null=True)),
            ],
        ),
        migrations.CreateModel(
            name='Inverted_index',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('word', models.CharField(max_length=50)),
                ('position', models.CharField(max_length=5000)),
                ('articles', models.ManyToManyField(to='full_text_search.Article')),
            ],
        ),
    ]
