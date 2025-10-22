using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using ShopAPI.Dtos.Cart;
using ShopAPI.Interfaces;
using System.Security.Claims;

namespace ShopAPI.Controllers;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme, Policy = "ActiveUserOnly")]
[ApiController]
[Route("api/shop/[controller]")]
public class CartController : ControllerBase
{
    private readonly ICartService _cartService;
    private readonly IWebSocketService _webSocketService;
    private readonly ILogger<CartController> _logger;

    public CartController(ICartService cartService, IWebSocketService webSocketService, ILogger<CartController> logger)
    {
        _cartService = cartService;
        _webSocketService = webSocketService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<ReadCartDto>> GetCart()
    {
        var userId = GetUserId();
        if (!userId.HasValue)
            return Unauthorized();

        var cart = await _cartService.GetCartAsync(userId.Value);
        return Ok(cart);
    }

    [HttpPost("add")]
    public async Task<ActionResult<ReadCartDto>> AddToCart([FromBody] AddToCartDto dto)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
            return Unauthorized();

        if (dto.ProductId <= 0)
            return BadRequest("Invalid product ID");

        if (dto.Quantity <= 0)
            return BadRequest("Quantity must be greater than 0");

        var cart = await _cartService.AddToCartAsync(userId.Value, dto);
        if (cart == null)
            return BadRequest("Product not found");

        return Ok(cart);
    }

    [HttpPut("items/{productId}")]
    public async Task<ActionResult<ReadCartDto>> UpdateCartItem(int productId, [FromBody] UpdateCartItemDto dto)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
            return Unauthorized();

        if (productId <= 0)
            return BadRequest("Invalid product ID");

        if (dto.Quantity < 0)
            return BadRequest("Quantity cannot be negative");

        var cart = await _cartService.UpdateCartItemAsync(userId.Value, productId, dto);
        if (cart == null)
            return NotFound("Cart item not found");

        _logger.LogInformation("User {UserId} updated cart item for product {ProductId}", userId, productId);
        return Ok(cart);
    }

    [HttpDelete("items/{productId}")]
    public async Task<IActionResult> RemoveFromCart(int productId)
    {
        var userId = GetUserId();
        if (!userId.HasValue)
            return Unauthorized();

        if (productId <= 0)
            return BadRequest("Invalid product ID");

        var success = await _cartService.RemoveFromCartAsync(userId.Value, productId);
        if (!success)
            return NotFound("Cart item not found");

        _logger.LogInformation("User {UserId} removed product {ProductId} from cart", userId, productId);
        return NoContent();
    }

    [HttpDelete("clear")]
    public async Task<IActionResult> ClearCart()
    {
        var userId = GetUserId();
        if (!userId.HasValue)
            return Unauthorized();

        await _cartService.ClearCartAsync(userId.Value);
        
        _logger.LogInformation("User {UserId} cleared their cart", userId);
        return NoContent();
    }

    [HttpGet("count")]
    public async Task<ActionResult<int>> GetCartItemCount()
    {
        var userId = GetUserId();
        if (!userId.HasValue)
            return Unauthorized();

        var count = await _cartService.GetCartItemCountAsync(userId.Value);
        return Ok(count);
    }

    [HttpPost("test-websocket")]
    public ActionResult TestWebSocket() // Removed async since we're not awaiting anything
    {
        var userId = GetUserId();
        if (!userId.HasValue)
            return Unauthorized();

        var requestId = Guid.NewGuid().ToString();
        
        _logger.LogInformation("WebSocket test initiated by user {UserId}, request {RequestId}", userId, requestId);
        
        // Start the background task that will trigger the button success after 5 seconds
        _ = Task.Run(async () => await _webSocketService.TriggerButtonSuccessAsync(userId.Value, requestId));
        
        // Return immediate response
        return Ok(new { requestId, message = "Request initiated, button will change to success in 5 seconds" });
    }

    private int? GetUserId()
    {
        var userIdString = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (int.TryParse(userIdString, out var userId))
            return userId;
        return null;
    }
}