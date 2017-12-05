from django.shortcuts import render
from django.http import JsonResponse
from collections import defaultdict, Counter, OrderedDict
import json
import heapq
import os
import re

PROJECT_DIR = os.path.dirname(os.path.abspath(__file__))


def load_clusters():
    clusterKeywords = json.load(open(os.path.join(PROJECT_DIR, 'cluster_keywords.json')))
    clusterInvetedIndex = defaultdict(list)
    for i, keywords in enumerate(clusterKeywords):
        for word, weight in keywords:
            heapq.heappush(clusterInvetedIndex[word], (weight, i))
    return clusterKeywords, clusterInvetedIndex
clusterKeywords, clusterInvetedIndex = load_clusters()


def create_keywords_index(articles):
    articleKeywordIndex = defaultdict(Counter)
    for i, (_, _, _, _, _, _, abstract_chunks, _, _, keywords) in enumerate(articles):
        for chunk in abstract_chunks:
            word = chunk.replace('_', ' ').strip()
            articleKeywordIndex[word][i] += 1
        for keyword in keywords.splitlines():
            word = keyword.lower()
            articleKeywordIndex[word][i] += 1
        # for word, weight in keywords:
        #     heapq.heappush(articleKeywordIndex[word], (weight, i))
    return articleKeywordIndex
articles = json.load(open(os.path.join(PROJECT_DIR, 'articles.json')))
articleKeywordIndex = create_keywords_index(articles)


def build_autoCompleteDict():
    autoCompleteCounter = Counter()
    for i, (_, _, _, _, _, _, abstract_chunks, _, _, keywords) in enumerate(articles):
        for chunk in abstract_chunks:
            word = chunk.replace('_', ' ').strip()
            autoCompleteCounter[word] += 1
        for keyword in keywords.splitlines():
            word = keyword.lower()
            autoCompleteCounter[word] += 1
    autoComplete = [word for word, count in autoCompleteCounter.most_common(10000)]
    return autoComplete
autoComplete = build_autoCompleteDict()


# Create your views here.
def search_topics(request, query):
    query = query.lower()
    results = [clusterKeywords[index] for weight, index in heapq.nlargest(10, clusterInvetedIndex[query])]
    return JsonResponse({'query': query, 'results': results})


# Create your views here.
def search_articles(request, query):
    queries = [word.strip() for word in query.lower().split(',')]
    result = defaultdict(lambda: defaultdict(list))
    articleScore = Counter()

    for query in queries:
        for index, count in articleKeywordIndex[query].most_common():
            articleScore[index] += count
        # for word in query.split():
        #     for index, count in articleKeywordIndex[word].most_common(100):
        #         articleScore[index] += count

    # for weight, index in heapq.nlargest(10, articleKeywordIndex[query]):
    for index, count in articleScore.most_common(100):
        cluster, department, advisor, title_zh, title_en, abstract_chunked, abstract_chunks, abstract_en, abstract_zh, keywords = articles[index]
        result[department][advisor].append((title_zh, title_en, abstract_zh))
    return JsonResponse({'query': queries[0], 'results': result})


def find_keywords(prefix, topn=10):
    for i, keyword in enumerate(filter(lambda x: x.startswith(prefix), autoComplete)):
        yield keyword
        if i > topn:
            break


def autocomplete(request):
    prefix = request.GET.get('term')
    prefix = ' '.join(prefix.split()).lower() if prefix else ''
    result = [{'id': word, 'label': word, 'value': word} for word in find_keywords(prefix)]
    return JsonResponse(result, safe=False)
