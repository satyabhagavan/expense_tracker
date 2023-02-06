from django.urls import path
from . import views

urlpatterns = [
    path('register/', views.register_user),
    path('get_email/', views.get_email),
    path('get_uid/', views.get_uid),
    path('get_info/', views.get_info),
    path('friends/', views.list_of_friends),
    path('add_friend/', views.create_a_friend),
    path('transaction/', views.record_transaction),
    path('transaction/<int:id>', views.delete_transaction),
    path('transactions/', views.get_users_transactions),
    path('settle_up/', views.settle_up)
]
