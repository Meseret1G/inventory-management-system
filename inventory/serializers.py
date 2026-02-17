from rest_framework import serializers
from .models import Product, Category, StockMovement

class ProductSerializer(serializers.ModelSerializer):
    is_low_stock = serializers.SerializerMethodField()
    
    class Meta:
        model = Product
        fields = '__all__'
    
    def get_is_low_stock(self, obj):
        return obj.quantity <= obj.low_stock_threshold
    
class StockAdjustmentSerializer(serializers.Serializer):
    quantity_change = serializers.IntegerField(help_text="Positive for stock in, negative for stock out")
    reason = serializers.CharField(max_length=255, help_text="Restock, Sale, Damage, etc.")
    
    def update_stock(self, product, user):
        change = self.validated_data['quantity_change']
        
        product.quantity += change
        if product.quantity < 0:
            raise serializers.ValidationError("Resulting stock cannot be negative.")
        product.save()
        
        
        StockMovement.objects.create(
            product=product,
            user=user,
            quantity_change=change,
            reason=self.validated_data['reason']
        )
        return product

class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(source='products.count', read_only=True)
    
    class Meta:
        model = Category
        fields = '__all__'