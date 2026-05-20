from django.shortcuts import render,HttpResponse
from rest_framework.decorators import api_view,permission_classes, parser_classes
from rest_framework.response import Response
from rest_framework import status
from .serializers import RegisterSerializer, CartSerializer,CartItemSerializer, OrderSerializer
from .serializers import ProductSerializer, CategorySerializer
from .models import Product, Category, Cart, CartItem, Order, OrderItem
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import User
from rest_framework.permissions import IsAdminUser
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
# Just use Django's built-in JWT view — don't write custom login logic
from rest_framework.pagination import PageNumberPagination
from rest_framework import parsers
from django.conf import settings


class ProductPagination(PageNumberPagination):
    page_size = 8                      # 8 products per page
    page_size_query_param = 'page_size' # optional: allow ?page_size=4
    max_page_size = 100

@api_view(['POST'])
@permission_classes([IsAdminUser])
@parser_classes([parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser])
def admin_create_product(request):
    serializer = ProductSerializer(data=request.data, context={'request': request})
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=400)

@api_view(['PUT', 'DELETE'])
@permission_classes([IsAdminUser])
@parser_classes([parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser])
def admin_product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
    except Product.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    if request.method == 'PUT':
        serializer = ProductSerializer(product, data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    if request.method == 'DELETE':
        product.delete()
        return Response({'message': 'Deleted successfully'})

@api_view(['GET'])
@permission_classes([IsAdminUser])
def admin_all_orders(request):
    orders = Order.objects.all().order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['PATCH'])
@permission_classes([IsAdminUser])
def admin_update_order_status(request, pk):
    try:
        order = Order.objects.get(pk=pk)
    except Order.DoesNotExist:
        return Response({'error': 'Not found'}, status=404)

    new_status = request.data.get('status')
    valid_statuses = ['pending', 'confirmed', 'shipped', 'delivered']
    if new_status not in valid_statuses:
        return Response({'error': 'Invalid status'}, status=400)

    order.status = new_status
    order.save()
    return Response({'message': 'Status updated', 'status': order.status})

@api_view(['GET'])
def home_view(request):
    return HttpResponse("Welcome To Ecommerce Home")

@api_view(['GET'])
def test_api(request):
    return Response({"message":"Django backend is connected!"})

@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response({"message":"User created successfully!"}, status=status.HTTP_201_CREATED)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def user_profile(request):
    user = request.user  # Get logged-in user from JWT token

    if request.method == 'GET':
        return Response({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'first_name': user.first_name,
            'last_name': user.last_name,
            'is_staff': user.is_staff,
        })

    if request.method == 'PUT':
        data = request.data
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.email = data.get('email', user.email)
        
        # Change password only if provided
        if data.get('password'):
            user.set_password(data['password'])  # Hashes the password securely
        
        user.save()
        return Response({'message': 'Profile updated successfully'})


@api_view(['GET'])
@permission_classes([AllowAny])
def product_list(request):
    products = Product.objects.all()

    search = request.query_params.get('search', '')
    if search:
        products = products.filter(name__icontains=search)

    category_id = request.query_params.get('category', '')
    if category_id:
        products = products.filter(category__id=category_id)

    min_price = request.query_params.get('min_price', '')
    max_price = request.query_params.get('max_price', '')
    if min_price:
        products = products.filter(price__gte=float(min_price))
    if max_price:
        products = products.filter(price__lte=float(max_price))

    if request.query_params.get('no_page'):
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response(serializer.data)

    # --- Pagination ---
    paginator = ProductPagination()
    paginated_products = paginator.paginate_queryset(products, request)
    serializer = ProductSerializer(paginated_products, many=True, context={'request': request})
    return paginator.get_paginated_response(serializer.data)

@api_view(['GET'])
def category_list(request):
    categories = Category.objects.all()
    serializer = CategorySerializer(categories, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def get_cart(request):
    # IsAuthenticated check — if no token, DRF returns 401 automatically
    if not request.user.is_authenticated:
        return Response({"error": "Login required"}, status=status.HTTP_401_UNAUTHORIZED)

    # get_or_create: fetch the user's cart, or create one if they don't have one yet
    cart, _ = Cart.objects.get_or_create(user=request.user)
    items = CartItem.objects.filter(cart=cart)
    serializer = CartItemSerializer(items, many=True)
    return Response(serializer.data)


@api_view(['POST'])
def add_to_cart(request):
    if not request.user.is_authenticated:
        return Response({"error": "Login required"}, status=status.HTTP_401_UNAUTHORIZED)

    cart, _ = Cart.objects.get_or_create(user=request.user)
    product_id = request.data.get('product_id')
    quantity = request.data.get('quantity', 1)

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)

    # get_or_create the cart item — if it already exists, just update quantity
    cart_item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    if not created:
        cart_item.quantity += int(quantity)   # if already in cart, add to existing qty
    else:
        cart_item.quantity = int(quantity)
    cart_item.save()

    serializer = CartItemSerializer(cart_item)
    return Response(serializer.data, status=status.HTTP_201_CREATED)


@api_view(['DELETE'])
def remove_from_cart(request, item_id):
    if not request.user.is_authenticated:
        return Response({"error": "Login required"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        cart_item.delete()
        return Response({"message": "Item removed"}, status=status.HTTP_204_NO_CONTENT)
    except CartItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['POST'])
def update_cart_item(request):
    if not request.user.is_authenticated:
        return Response({"error": "Login required"}, status=status.HTTP_401_UNAUTHORIZED)

    item_id = request.data.get('item_id')
    quantity = request.data.get('quantity')

    try:
        cart_item = CartItem.objects.get(id=item_id, cart__user=request.user)
        cart_item.quantity = int(quantity)
        cart_item.save()
        return Response({"message": "Updated"})
    except CartItem.DoesNotExist:
        return Response({"error": "Item not found"}, status=status.HTTP_404_NOT_FOUND)
    



@api_view(['POST'])
def place_order(request):
    if not request.user.is_authenticated:
        return Response({"error": "Login required"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        cart = Cart.objects.get(user=request.user)
        cart_items = CartItem.objects.filter(cart=cart)

        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=status.HTTP_400_BAD_REQUEST)

        # calculate total
        total = sum(item.product.price * item.quantity for item in cart_items)

        # create the order
        order = Order.objects.create(user=request.user, total_price=total)

        # copy each cart item into an order item (with price snapshot)
        for item in cart_items:
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price_at_purchase=item.product.price
            )

        # clear the cart after placing the order
        cart_items.delete()

        serializer = OrderSerializer(order)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    except Cart.DoesNotExist:
        return Response({"error": "Cart not found"}, status=status.HTTP_404_NOT_FOUND)


@api_view(['GET'])
def order_history(request):
    if not request.user.is_authenticated:
        return Response({"error": "Login required"}, status=status.HTTP_401_UNAUTHORIZED)

    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)



@api_view(['GET'])
def product_detail(request, pk):
    try:
        product = Product.objects.get(pk=pk)
        serializer = ProductSerializer(product)
        return Response(serializer.data)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
    

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_orders(request):
    orders = Order.objects.filter(user=request.user).order_by('-created_at')
    serializer = OrderSerializer(orders, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    try:
        cart = Cart.objects.get(user=request.user)
        CartItem.objects.filter(cart=cart).delete()
        return Response({"message": "Cart cleared"})
    except Cart.DoesNotExist:
        return Response({"message": "No cart found"})