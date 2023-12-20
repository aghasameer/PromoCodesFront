"use strict";

const loggedIn = readCookie("admin");
const adminUser = "admin@promos.com";
const adminPass = "Admin123#";
const fixedShippingCost = 100;

if (loggedIn == "true") {
    $("#LogoutButton").parent().removeClass("hidden");
    $("#LoginButton").parent().addClass("hidden");
    $("#DashboardButton").parent().removeClass("hidden");
} else {
    $("#LogoutButton").parent().addClass("hidden");
    $("#LoginButton").parent().removeClass("hidden");
    $("#DashboardButton").parent().addClass("hidden");
}

$("#LogoutButton").on('click', function (e) {
    eraseCookie("admin");
    location.href = "/Index";
})


function getProducts() {

    $.ajax({
        dataType: "json",
        cache: !1,
        type: "GET",
        url: "https://promocodesprocessor.azurewebsites.net/api/Products",
        /*data: "promo=" + o + "&type=" + s + "&referrer=" + a,*/
        success: function (data) {

            const productItems = Object.values(data.result);
            const shuffled = productItems.sort(() => 0.5 - Math.random());
            const selected = shuffled.slice(0, 4);

            const container = document.querySelector("#productsTable tbody");
            
            $.each(selected, function (key, value) {

                let product = this;

                $(container).append(`
                    <tr data-product-id="${product.id}">
                        <td class="table__item">
                            <h6 class="margin-0" data-product-name="">${product.name}</h6>
                            <small data-category-id="${product.categoryId}">${product.categoryName}</small>
                        </td>
                        <td>SAR <span data-product_price="${product.price}">${product.price}</span></td>
                        <td class="hidden-smallest">
                            <div class="quantity-choose quantity-choose--sep">
                                <div class="quantity buttons_added">
                                    <div class="qtyminus-wrap">
                                        <input type="button" value="-" class="qtyminus quantity__elem" data-field="productitem-${product.id}" />
                                    </div>
                                    <input type="text" name="productitem-${product.id}" value="1" class="qty quantity__elem" />
                                    <div class="qtyplus-wrap">
                                        <input type="button" value="+" class="qtyplus quantity__elem" data-field="productitem-${product.id}" />
                                    </div>
                                </div>
                            </div>
                        </td>
                        <td>
                            <div class="total-place">
                                SAR <span data-product-total="${product.price}">${product.price}</span>
                            </div>
                        </td>
                    </tr>
                `)

            })


        },
        complete: function () {
            qNumber();
            
            calculateTotals()

        }
    })

}

function getUsers() {

    const container = $("#promoUsers"); 

    $.ajax({
        dataType: "json",
        cache: !1,
        type: "GET",
        url: "https://promocodesprocessor.azurewebsites.net/api/Users",
        success: function (data) {

            
            $.each(data.result, function (key, value) {
                
                $(container).append(`
                    <option ${value.user_id == 1 ? "selected" : ""} value="${value.user_id}">${value.user_name}</option>
                `)

            })


        },
        complete: function () {

            /*selectBox();*/
        }
    })


}


function getCategories() {

    const container = $("#promoCategories");

    $.ajax({
        dataType: "json",
        cache: !1,
        type: "GET",
        url: "https://promocodesprocessor.azurewebsites.net/api/Categories",
        success: function (data) {


            $.each(data.result, function (key, value) {

                $(container).append(`
                    <option value="${value.category_id}">${value.category_name}</option>
                `)

            })


        },
        complete: function () {

            /*selectBox();*/
        }
    })


}

function quantityChange(element) {
    const parent = $(element).parents().closest("tr");
    const quantity = Number($(parent).find(".qty.quantity__elem").val());
    const baseprice = Number($(parent).find("[data-product_price]").text());

    const total = baseprice * quantity;

    $(parent).find("[data-product-total]").attr("data-product-total", total);
    $(parent).find("[data-product-total]").text(total);

    calculateTotals();
}

function calculateTotals() {

    const shipping = sessionStorage.getItem("shipping") ? Number(sessionStorage.getItem("shipping")) : fixedShippingCost;
    const discount = sessionStorage.getItem("discount") ? Number(sessionStorage.getItem("discount")) : 0;

    const cart_summary = $("#cart_summary");

    let cartSubtotal = 0;
    

    const lineTotals = $("#productsTable [data-product-total]");

    $.each(lineTotals, function (key, value) {
        let linetotal = Number($(value).attr("data-product-total"));
        cartSubtotal = cartSubtotal + linetotal;
    })



    $(cart_summary).find(".cart_subtotal").text(cartSubtotal);
    $(cart_summary).find(".cart_shipping").text(shipping);
    $(cart_summary).find(".cart_discount").text(discount);

    let cartTotal = (cartSubtotal + shipping) - discount;

    $(".cart_total").text(cartTotal);

}

function getPromos() {

    const container = $("#promosTable tbody");

    $.ajax({
        dataType: "json",
        cache: !1,
        type: "GET",
        url: "https://promocodesprocessor.azurewebsites.net/api/Promos",
        success: function (data) {

            if (data.result.length > 0) {
                $.each(data.result, function (key, value) {

                    let promoItem = this;
                    let categoriesList = "<em>Not Limited</em>";

                    if (promoItem.categories.length > 0) {
                        categoriesList = "";
                        $.each(promoItem.categories, function (k, v) {
                            categoriesList += v.category_name + ", ";

                        })

                        categoriesList = categoriesList.slice(0, -2);
                    }



                    $(container).append(`
                        <tr data-promo-id=${promoItem.id}>
                            <td>
                                <p class="promo-name margin-0 text-bold">${promoItem.name} <i data-toggle="tooltip" data-placement="top" title="${promoItem.description}" class="fa fa-question-circle tooltip-link fa-icon-2x"></i></p>
                                <small>Redeemed: <span class="promo-redeem-count">${promoItem.redeem_count}</span></small>
                            </td>
                            <td>
                                <p class="promo-discount-value margin-0">${promoItem.discount_type == 1 ? promoItem.discount_value + '%' : 'SAR' + promoItem.discount_value}</p>
                                <small>Minimum Order: <span class="promo-minimum-order">SAR ${promoItem.min_order}</span></small><br/>
                                <small>Multiple Usage: <span class="promo-minimum-order">${promoItem.multiple_use == true ? "Allowed" : "Not Allowed"}</span></small>
                            </td>
                            
                            <td>
                                ${promoItem.free_shipping == true ? "Allowed" : "Not Allowed"}
                            </td>
                            <td>
                                ${categoriesList}
                            </td>
                            <td>
                                <a data-id="${promoItem.id}" class="link link--title" href="/AddPromoCode?Id=${promoItem.id}">Edit</a>
                                <a data-id="${promoItem.id}" class="link link--title text-danger promo-item-delete" href="#">Delete</a>
                            </td>
                        </tr>
                `)

                })

            } else {

                $(container).append(`<tr><td colspan="100%" class="text-center"> No promos yet. </td></tr>`)

            }
        },
        complete: function () {

            tooltips();
            /*selectBox();*/
        }
    })


}

function deletePromo(promoId) {

    

    $.ajax({
        dataType: "json",
        cache: !1,
        type: "DELETE",
        url: "https://promocodesprocessor.azurewebsites.net/api/Promos/" + promoId,
        success: function (data) {


            $("#promosTable").find(`tr[data-promo-id=${promoId}]`).remove();


        },
        complete: function () {

            /*selectBox();*/
        }
    })

}


function getPromo(promoId) {

    

    $.ajax({
        dataType: "json",
        cache: !1,
        type: "GET",
        url: "https://promocodesprocessor.azurewebsites.net/api/Promos/" + promoId,
        success: function (data) {

            const promo = data.result;

            $("#createPromo").find(`[name='name']`).val(promo.name);
            $("#createPromo").find(`[name='discount_type']`).val(promo.discount_type);
            $("#createPromo").find(`[name='discount_value']`).val(promo.discount_value);
            $("#createPromo").find(`[name='free_shipping']`).val(promo.free_shipping == false ? 0 : 1);
            $("#createPromo").find(`[name='min_order']`).val(promo.min_order);
            $("#createPromo").find(`[name='multiple_use']`).val(promo.multiple_use == false ? 0 : 1);
            $("#createPromo").find(`[name='description']`).val(promo.description);

            const catIds = promo.categories.map(promo => promo.category_id);
            $("#createPromo").find(`[name='categories']`).val(catIds);

            const userIds = promo.users.map(promo => promo.user_id);
            $("#createPromo").find(`[name='users']`).val(userIds);
        },
        complete: function () {

            /*selectBox();*/
        }
    })

}


$("#applyPromoCode").on("click", function (e) {
    e.preventDefault();

    $("#redeem_error").addClass("hidden");
    $(this).attr("disabled", "disabled");
    $("#promoCode").attr("disabled", "disabled");
    $(".quantity__elem").attr("disabled", "disabled");

    const promoUser = $("#promoUsers").val();
    const promoCode = $("#promoCode").val();

    if (promoCode == "") {
        alert("Enter a promo code to redeem discount.");
        return false;
    }

    let redeemData = {
        user_id: promoUser,
        promo_code: promoCode.trim()
    };



    $.ajax({
        dataType: "json",
        cache: false,
        async: false,
        type: "POST",
        url: "https://promocodesprocessor.azurewebsites.net/api/Promos/Redeem",
        data: JSON.stringify(redeemData),
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: function (data) {

            const redeemData = data.result;

            const categories = redeemData.allowed_categories;

            const discountType = redeemData.discount_type;
            const discountValue = redeemData.discount_value;

            const shippingFree = redeemData.shipping_free;
            const minimumOrder = redeemData.min_order;



            let cartTotal = Number($(".cart_total").text());

            if (cartTotal < minimumOrder) {
                $("#redeem_error_message").text(`Your order total is less than the minimum order of SAR ${new Intl.NumberFormat().format(minimumOrder)} required to redeem this promo code.`);
                $("#redeem_error").removeClass("hidden");

                $("#applyPromoCode").attr("disabled", false);
                $("#promoCode").attr("disabled", false);
                $(".quantity__elem").attr("disabled", false);
                return false;
            }

            const shipping = shippingFree ? 0 : fixedShippingCost;


            let totalDiscount = 0;

            $.each(categories, function (key, value) {
                let category = this;
                let discountable = $(`#productsTable tbody tr [data-category-id=${category.category_id}]`);

                $.each(discountable, function (key, value) {
                    let beforeDiscount = Number($(this).parents("tr").find("[data-product-total]").text());

                    let discountAmount = 0;
                    if (discountType == 1) {
                        discountAmount = beforeDiscount - (beforeDiscount * (discountValue / 100));
                    } else {
                        discountAmount = beforeDiscount - discountValue;
                    }

                    if (discountAmount < 0) {
                        discountAmount = 0;
                    }

                    totalDiscount = totalDiscount + (beforeDiscount - discountAmount);



                    $(this).parents("tr").find("[data-product-total]").text(discountAmount);

                })
            })

            sessionStorage.setItem("redeemPromoId", redeemData.promo_id);
            sessionStorage.setItem("shipping", shipping);
            sessionStorage.setItem("discount", totalDiscount);

            calculateTotals();

            $("#applyPromoCode").html(`<i class="fa fa-check-circle-o text-success margin-top-3"></i> Applied`);

        },
        complete: function () {


        },
        error: function (x, o, m) {

            const error = JSON.parse(x.responseText);
            $("#redeem_error_message").text(error.message);
            $("#redeem_error").removeClass("hidden");
            $("#applyPromoCode").attr("disabled", false);
            $("#promoCode").attr("disabled", false);
            $(".quantity__elem").attr("disabled", false);

            return false;
        },
    })
})


function purchasePromo(promoId, userId) {

    let purchaseData = {
        promo_id: promoId,
        user_id: userId,
    };


    $.ajax({
        dataType: "json",
        cache: false,
        async: true,
        type: "POST",
        url: "https://promocodesprocessor.azurewebsites.net/api/Promos/Purchase",
        data: JSON.stringify(purchaseData),
        contentType: "application/json; charset=utf-8",
        traditional: true,
        success: function (data) {

            location.href = '/Purchased';

        },
        error: function (x, o, m) {

            if (x.responseText != "") {
                const error = JSON.parse(x.responseText);
                $("#redeem_error_message").text(error.message);
            } else {
                $("#redeem_error_message").text("Something strange has happened. Try again in a while. Server Code: " + x.status);
            }
            
            $("#redeem_error").removeClass("hidden");

            $("#applyPromoCode").attr("disabled", false);
            $("#promoCode").attr("disabled", false);
            $(".quantity__elem").attr("disabled", false);

            return false;
        },
    })

}