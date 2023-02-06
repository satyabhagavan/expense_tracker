from django.shortcuts import render
from django.http import HttpResponse, JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.db import transaction
import json
from datetime import datetime

from tracker.models import users
from tracker.models import friends
from tracker.models import transactions
from tracker.models import transactions_users_involved
from django.db.models import Q
from decimal import *
import time

# Create your views here.
# reuest response handler


@csrf_exempt
@require_http_methods(["POST"])
def get_info(request):
    data = json.loads(request.body)
    response_data = {}

    if data.get("email") is None and data.get("uid") is None:
        response_data['message'] = 'email or userid is required'
        return JsonResponse(response_data, status=400)

    try:
        if data.get("uid") is not None:
            user = users.objects.get(id=data['uid'])
        if data.get("email") is not None:
            user = users.objects.get(email=data['email'])
    except users.DoesNotExist:
        response_data['message'] = 'user does\'t exist'
        return JsonResponse(response_data, status=400)

    response_data["message"] = "user fetched succefully"
    details = {}
    details["email"] = user.email
    details["uid"] = user.id
    details["name"] = user.name
    details["phone_number"] = user.phone_number

    response_data["data"] = details

    return JsonResponse(response_data, status=200)


@csrf_exempt
@require_http_methods("POST")
def get_users_transactions(request):
    data = json.loads(request.body)
    response_data = {}

    try:
        if data.get("uid") is not None:
            user = users.objects.get(id=data['uid'])
        if data.get("email") is not None:
            user = users.objects.get(email=data['email'])
    except users.DoesNotExist:
        response_data['message'] = 'user does\'t exist'
        return JsonResponse(response_data, status=400)

    # transactions have two types
    # payed by the user
    txns = transactions.objects.filter(transaction_done_by_id=user)
    transactions_done = []
    for each_txn in txns:
        # print(each_txn.__dict__)
        temp_data = {}
        temp_data["id"] = each_txn.id
        temp_data["time"] = each_txn.transaction_time
        temp_data["amount"] = each_txn.transaction_amount
        temp_data["no_of"] = int(each_txn.transaction_among)
        temp_data["done_by"] = user.email
        temp_data["discription"] = each_txn.transaction_discr
        temp_users = transactions_users_involved.objects.filter(
            tid_id=each_txn.id)

        # finding users involved in the transaction
        users_involved = []
        users_involved.append(user.email)
        for u in temp_users:
            users_involved.append(u.uid.email)

        temp_data["users"] = users_involved
        # print(temp_users)

        transactions_done.append(temp_data)

    response_data["done_by_user"] = transactions_done
    # print(transactions_done)

    # involved in the transaction
    txns_inv = transactions_users_involved.objects.filter(uid=user)
    transactions_involved = []

    for each_txn in txns_inv:
        temp_data = {}
        txn_details = transactions.objects.get(id=each_txn.tid_id)
        temp_data["id"] = txn_details.id
        temp_data["time"] = txn_details.transaction_time
        temp_data["amount"] = txn_details.transaction_amount
        temp_data["no_of"] = int(txn_details.transaction_among)
        temp_data["done_by"] = txn_details.transaction_done_by.email
        temp_data["discription"] = txn_details.transaction_discr
        temp_users = transactions_users_involved.objects.filter(
            tid_id=each_txn.tid_id)
        users_involved = [txn_details.transaction_done_by.email]
        # print(temp_users)
        for x in temp_users:
            users_involved.append(x.uid.email)

        temp_data["users"] = users_involved

        transactions_involved.append(temp_data)
        # print(temp_data)

    # print(transactions_involved)
    response_data["involved_by_user"] = transactions_involved

    return JsonResponse(response_data, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def record_transaction(request):
    data = json.loads(request.body)

    response_data = {}

    if data.get("email") is None and data.get("uid") is None:
        response_data['message'] = 'email or userid is required'
        return JsonResponse(response_data, status=400)

    if data.get("users_involved") is None:
        response_data['message'] = "users involved in the transaction are required"
        return JsonResponse(response_data, status=406)

    try:
        if data.get("uid") is not None:
            user = users.objects.get(id=data['uid'])
        if data.get("email") is not None:
            user = users.objects.get(email=data['email'])
    except users.DoesNotExist:
        response_data['message'] = 'user does\'t exist'
        return JsonResponse(response_data, status=400)

    # print(user.__dict__)
    # user info

    users_involved = data["users_involved"]
    payed_by = data["payed_by"]

    if type(payed_by) == str:
        # email
        try:
            payer_info = users.objects.get(email=payed_by)
        except users.DoesNotExist:
            response_data['message'] = 'user does\'t exist'
            return JsonResponse(response_data, status=400)
    else:
        # uid
        try:
            payer_info = users.objects.get(id=payed_by)
        except users.DoesNotExist:
            response_data['message'] = 'user does\'t exist'
            return JsonResponse(response_data, status=400)

    # print(payer_info.__dict__)
    print(len(users_involved))
    no_of_users = len(users_involved)

    if no_of_users == 0:
        response_data["message"] = "min one user have to be involved in transaction"
        return JsonResponse(response_data, status=400)

    amount_payed = data["amount"]
    amount_per_person = round(amount_payed/no_of_users, 2)
    amount_per_person = Decimal(amount_per_person)

    # print(amount_per_person)

    users_involved_objs = []

    for each in users_involved:
        try:
            temp_user = users.objects.get(email=each)
            if temp_user.id != payer_info.id:
                users_involved_objs.append(temp_user)
            # print(temp_user.__dict__)
        except users.DoesNotExist:
            print("user doen't exist")
            # so we can create the user
            email = each
            name = ""
            for c in email:
                if c == '@':
                    break
                name = name + c

            # print(name)
            temp = users(name=name, email=each,
                         phone_number=0, amount=0)

            temp.save()
            print("user created")

    print(users_involved_objs)

    # we will go through the friendships and update the amounts there

    for user in users_involved_objs:
        # here payed user will have positive as he payed the money
        try:
            freindship = friends.objects.get(
                user_id=payer_info.id, friends_id=user.id)
            # print(freindship.__dict__)

            freindship.amount = freindship.amount + amount_per_person
            freindship.save()

        except friends.DoesNotExist:
            print("friendship doesn't exist")
            # creating friendship
            temp_friends = friends(user_id=payer_info.id,
                                   friends_id=user.id, amount=amount_per_person)
            try:
                temp_friends.save()
            except:
                response_data['message'] = 'error occured while creating friendship'
                return JsonResponse(response_data, status=400)

        # here other users will have negative money with the payed user

        try:
            freindship = friends.objects.get(
                user_id=user.id, friends_id=payer_info.id)

            freindship.amount = freindship.amount - amount_per_person
            freindship.save()

            # print(freindship.__dict__)
        except friends.DoesNotExist:
            print("friendship doesn't exist")
            temp_friends = friends(
                user_id=user.id, friends_id=payer_info.id, amount=-1*amount_per_person)
            try:
                temp_friends.save()
            except:
                response_data['message'] = 'error occured while creating friendship'
                return JsonResponse(response_data, status=400)

    # have to save the transaction in two tables
    time_now = datetime.now()
    transaction_obj = transactions(transaction_time=time_now, transaction_done_by=payer_info,
                                   transaction_amount=amount_payed, transaction_among=no_of_users,transaction_discr=data["discription"])
    try:
        transaction_obj.save()
    except:
        response_data['message'] = "error occured while adding transaction"
        return JsonResponse(response_data, status=400)

    # have to add this transaction details to the respective users
    txn = transactions.objects.get(transaction_time=time_now)

    for user in users_involved_objs:
        temp_txnu = transactions_users_involved(tid=txn, uid=user)
        try:
            temp_txnu.save()
        except:
            response_data['message'] = "error occured while adding transaction"
            return JsonResponse(response_data, status=400)

    response_data['message'] = "transaction successful"
    return JsonResponse(response_data, status=200)


@csrf_exempt
@require_http_methods(["DELETE"])
def delete_transaction(request, id):
    response_data = {}

    # print(id)

    try:
        txn = transactions.objects.get(id=id)

    except transactions.DoesNotExist:
        response_data['message'] = "transaction id is wrong or the transaction has been deleted"
        return JsonResponse(response_data, status=400)

    users_involved_count = txn.transaction_among
    amount = txn.transaction_amount
    payed_by = txn.transaction_done_by  # it is user object who payed
    users_involved = []

    amount_per_person = round(amount/users_involved_count, 2)

    txns_involv = transactions_users_involved.objects.filter(tid_id=txn.id)

    # print(txns_involv)
    for each_tx in txns_involv:
        users_involved.append(each_tx.uid)

    # print(payed_by, users_involved)

    # we have to do reverse of the adding and deleting money

    for user in users_involved:
        # here payed user will have positive as he payed the money
        try:
            freindship = friends.objects.get(
                user_id=payed_by.id, friends_id=user.id)
            # print(freindship.__dict__)

            freindship.amount = freindship.amount - amount_per_person
            freindship.save()

        except friends.DoesNotExist:
            print("friendship doesn't exist")
            # creating friendship
            temp_friends = friends(user_id=payed_by.id,
                                   friends_id=user.id, amount=-1*amount_per_person)
            try:
                temp_friends.save()
            except:
                response_data['message'] = 'error occured while creating friendship'
                return JsonResponse(response_data, status=400)

        # here other users will have negative money with the payed user

        try:
            freindship = friends.objects.get(
                user_id=user.id, friends_id=payed_by.id)

            freindship.amount = freindship.amount + amount_per_person
            freindship.save()

            # print(freindship.__dict__)
        except friends.DoesNotExist:
            print("friendship doesn't exist")
            temp_friends = friends(
                user_id=user.id, friends_id=payed_by.id, amount=amount_per_person)
            try:
                temp_friends.save()
            except:
                response_data['message'] = 'error occured while creating friendship'
                return JsonResponse(response_data, status=400)

    txn.delete()
    response_data["message"] = "transaction deleted succesfully"

    return JsonResponse(response_data, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def list_of_friends(request):
    data = json.loads(request.body)

    response_data = {}

    try:
        if data.get("uid") is not None:
            user = users.objects.get(id=data['uid'])
        if data.get("email") is not None:
            user = users.objects.get(email=data['email'])
    except users.DoesNotExist:
        response_data['message'] = 'user does\'t exist'
        return JsonResponse(response_data, status=400)

    # print(user.__dict__)
    # return JsonResponse(response_data, status=200)

    # print(user)
    friendhips = friends.objects.filter(user_id=user.id)
    # print(friendhips)
    info = []
    for each in friendhips:
        # print(each.__dict__)
        details = {}
        temp = users.objects.get(id=each.friends_id)
        print(temp)
        details['name'] = temp.name
        details['email'] = temp.email
        details['friend_id'] = each.friends_id
        details['amount'] = each.amount
        info.append(details)

    # print(info)
    response_data['data'] = info
    response_data['message'] = 'friends are'
    status = 200
    return JsonResponse(response_data, status=status)


@csrf_exempt
@require_http_methods(["POST"])
def get_email(request):
    data = json.loads(request.body)
    response_data = {}

    try:
        user = users.objects.get(id=data["uid"])
    except users.DoesNotExist:
        response_data["message"] = "user does not exist with given id"
        return JsonResponse(response_data, status=404)

    print(user.__dict__)

    response_data["email"] = user.email
    response_data["message"] = "email id fetched successfully"
    return JsonResponse(response_data, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def get_uid(request):
    data = json.loads(request.body)
    response_data = {}

    try:
        user = users.objects.get(email=data["email"])
    except users.DoesNotExist:
        response_data["message"] = "user does not exist with given email id"
        return JsonResponse(response_data, status=404)

    response_data["uid"] = user.id
    response_data["message"] = "user id fetched successfully"
    return JsonResponse(response_data, status=200)


@csrf_exempt
@require_http_methods(["POST"])
def register_user(request):
    data = json.loads(request.body)
    print(data)

    response_data = {}
    if data.get("email") is None:
        response_data['result'] = 'error'
        response_data['message'] = 'email is missing'
        return JsonResponse(response_data, status=400)

    elif data.get("name") is None:
        response_data['result'] = 'error'
        response_data['message'] = 'name is missing'
        return JsonResponse(response_data, status=400)

    elif data.get("phone_number") is None:
        response_data['result'] = 'error'
        response_data['message'] = 'mobile number is missing'
        return JsonResponse(response_data, status=400)

    try:
        user = users.objects.get(email=data['email'])
    except users.DoesNotExist:
        print("User is not present")
    else:
        response_data['result'] = 'error'
        response_data['message'] = 'user with same email is already present'
        print("User is present")
        return JsonResponse(response_data, status=400)

    new_user = users(name=data['name'], email=data['email'],
                     phone_number=data['phone_number'], amount=0)

    try:
        new_user.save()
        response_data['message'] = 'User created'
        status = 201
    except:
        response_data['message'] = 'Error Occured while creating user'
        status = 400

    return JsonResponse(response_data, status=status)


@ csrf_exempt
@ require_http_methods(["POST"])
def create_a_friend(request):
    data = json.loads(request.body)

    response_data = {}
    user = users.create()
    friend_user = users.create()

    if data.get("email") is None and data.get("uid") is None:
        response_data['message'] = 'email or userid is required'
        return JsonResponse(response_data, status=400)

    if data.get("friend_email") is None and data.get("friend_uid") is None:
        response_data['message'] = 'friend email or friend_uid is required'
        return JsonResponse(response_data, status=400)

    try:
        if data.get("uid") is None:
            user = users.objects.get(email=data['email'])
        if data.get("email") is None:
            user = users.objects.get(id=data['uid'])
        # print(user.__dict__)
    except users.DoesNotExist:
        response_data['message'] = 'user does\'t exist'
        return JsonResponse(response_data, status=400)

    try:
        if data.get("friend_email") is None:
            friend_user = users.objects.get(id=data['friend_uid'])
        if data.get("friend_uid") is None:
            friend_user = users.objects.get(email=data['friend_email'])
        # print(friend_user.__dict__)
    except users.DoesNotExist:
        response_data['message'] = 'user with that email does not exist'
        return JsonResponse(response_data, status=400)

    if user.id == friend_user.id:
        response_data['message'] = 'user and friend should be different'
        return JsonResponse(response_data, status=400)

    print(user, friend_user)
    try:
        freindship = friends.objects.get(user=user.id, friends=friend_user.id)
    except friends.DoesNotExist:
        print("friend is not present")
        new_friend = friends(user=user, friends=friend_user, amount=0)
        new_friend_revers = friends(
            user=friend_user, friends=user, amount=0)
        try:
            new_friend.save()
            new_friend_revers.save()
            response_data['message'] = 'friendship created'
            status = 201
            return JsonResponse(response_data, status=status)
        except:
            response_data['message'] = 'Error Occured while creating frendship'
            status = 400
            return JsonResponse(response_data, status=status)

    response_data['message'] = 'friendship already exits'
    status = 205
    return JsonResponse(response_data, status=status)

@csrf_exempt
@require_http_methods(["POST"])
# @transaction.atomic
def settle_up(request):
    data = json.loads(request.body)
    response_data = {}

    if  data.get("uid") is None:
        response_data['message'] = 'userid is required'
        return JsonResponse(response_data, status=400)

    if data.get("friend_uid") is None:
        response_data['message'] = 'friend_uid is required'
        return JsonResponse(response_data, status=400)

    try:
        user = users.objects.get(id=data['uid'])
    except users.DoesNotExist:
        response_data['message'] = 'user Doesn\'t exist'
        return JsonResponse(response_data, status = 400)

    try:
        friend = users.objects.get(id=data['friend_uid'])
    except users.DoesNotExist:
        response_data['message'] = 'friend doesn\'t exist'
        return JsonResponse(response_data, status = 400)

    # getting friend ship objects of the users
    try:
        frnship = friends.objects.get(user=user, friends = friend)
    except friends.DoesNotExist:
        response_data['message'] = 'friendship doesn\'t exit'
        return JsonResponse(response_data, status=400)

    try:
        frnship_other = friends.objects.get(user = friend, friends = user)
    except friends.DoesNotExist:
        response_data['message'] = 'friendship doesn\'t exit'
        return JsonResponse(response_data, status=400)

    if frnship.amount == 0:
        response_data['message'] = 'Already settled up 🎉 with {}'.format(friend.name)
        return JsonResponse(response_data,status=200)


    frnship.amount = 0
    frnship_other.amount = 0

    try:
        frnship.save()
        frnship_other.save()
    except Exception as e:
        response_data['message'] = 'error occured while settling up'
        response_data['error'] = e
        print(e)
        return JsonResponse(response_data, status=400)

    response_data['message'] = 'settled up 🎉 with {}'.format(friend.name)
    return JsonResponse(response_data, status = 200)
