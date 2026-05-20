from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Product, Category
from .models import Cart, CartItem
from .models import  Order, OrderItem


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['username','email','password']

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        return user
    
class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'
    
class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    image_display = serializers.SerializerMethodField()

    def get_image_display(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return obj.image_url or ''

    class Meta:
        model = Product
        fields = ['id', 'name', 'description', 'price', 'stock',
                  'image_url', 'image', 'image_display', 'category', 'category_name']


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)   # nest full product info inside each cart item
    product_id = serializers.IntegerField(write_only=True)  # accept product_id when adding

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'product_id', 'quantity']

class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    # 'items' matches the related_name='items' we set in the model above

    class Meta:
        model = Cart
        fields = ['id', 'items']


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'product_name', 'quantity', 'price_at_purchase']

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ['id', 'status', 'total_price', 'created_at', 'items']

