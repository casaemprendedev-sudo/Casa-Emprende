<template>
    <nav aria-label="breadcrumb" class="breadcrumb-nav">
        <ol class="breadcrumb mb-0">
            <li class="breadcrumb-item">
                <router-link to="/">
                    <i class="fas fa-home"></i>
                    <span class="ms-2">Inicio</span>
                </router-link>
            </li>
            <li v-for="(item, index) in items" :key="index" class="breadcrumb-item"
                :class="{ active: index === items.length - 1 }">
                <router-link v-if="item.to && index !== items.length - 1" :to="item.to">
                    <i v-if="item.icon" :class="item.icon" class="me-1"></i>
                    {{ item.text }}
                </router-link>
                <span v-else>
                    <i v-if="item.icon" :class="item.icon" class="me-1"></i>
                    {{ item.text }}
                </span>
            </li>
        </ol>
    </nav>
</template>

<script setup>
defineProps({
    items: {
        type: Array,
        required: true,
        validator: (items) => {
            return items.every(item => item.text)
        }
    }
})
</script>

<style scoped>
.breadcrumb-nav {
    background: white;
    padding: 1rem 1.25rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.breadcrumb {
    background: transparent;
}

.breadcrumb-item a {
    color: #0d6efd;
    text-decoration: none;
    transition: color 0.2s;
}

.breadcrumb-item a:hover {
    color: #0a58ca;
    text-decoration: underline;
}

.breadcrumb-item.active {
    color: #6c757d;
    font-weight: 500;
}

.breadcrumb-item+.breadcrumb-item::before {
    content: "›";
    font-size: 1.2rem;
    color: #6c757d;
}
</style>
