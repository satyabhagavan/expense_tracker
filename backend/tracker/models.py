from django.db import models

# Create your models here.


class users(models.Model):
    # first_name = models.CharField(max_length=30)
    # last_name = models.CharField(max_length=30)
    name = models.CharField(max_length=40)
    email = models.CharField(max_length=50, unique=True)
    phone_number = models.CharField(max_length=13)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    @classmethod
    def create(cls, name=None, email=None, phone_number=None, amount=None):
        user = users(name=name, email=email,
                     phone_number=phone_number, amount=amount)
        return user


class friends(models.Model):
    user = models.ForeignKey(
        users, on_delete=models.CASCADE, related_name='topic_content_type')
    friends = models.ForeignKey(users, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)


class transactions(models.Model):
    transaction_time = models.DateTimeField()
    transaction_done_by = models.ForeignKey(users, on_delete=models.CASCADE)
    transaction_amount = models.DecimalField(max_digits=10, decimal_places=2)
    transaction_among = models.DecimalField(max_digits=10, decimal_places=2)


class transactions_users_involved(models.Model):
    tid = models.ForeignKey(transactions, on_delete=models.CASCADE)
    uid = models.ForeignKey(users, on_delete=models.CASCADE)
