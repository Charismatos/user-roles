@vite(['resources/css/Groupings/Editor/categories.css', 'resources/js/Groupings/Editor/categories.js'])

<style>
    .hidden {
        display: none;
    }
</style>
<div class="form-group pf-screen-center">
    <div class="pf-card-bounding-box">

        <x-alerts.alert sessionKey="category_store_success" message="Category Added Successfuly"
            wrapperClass="pa-alert pa-success category_store_success_alert hidden" messageClass="pa-msg" role="alert"
            data-auto-dismiss="true" />

        <x-alerts.alert sessionKey="category_update_success" message="Category Updated Successfuly"
            wrapperClass="pa-alert pa-success category_update_success_alert hidden" messageClass="pa-msg" role="alert"
            data-auto-dismiss="true" />

        <x-alerts.alert sessionKey="category_delete_success" message="Category Deleted Successfuly"
            wrapperClass="pa-alert pa-success category_delete_success_alert hidden" messageClass="pa-msg" role="alert"
            data-auto-dismiss="true" />

        {{-- Category Management Header Section --}}
        <header>
            <h1 class="pf-centered">Category Focus</h1>
        </header>


        @php
            $fullPathArray = [];
            $pointer = $associateModel?->category ?? null;
            while ($pointer) {
                array_unshift($fullPathArray, $pointer->slug);
                $pointer = $pointer->parent;
            }
        @endphp

        <form method="POST" class="pf-card pf-centered" novalidate>
            @csrf

            {{-- Top-Level Validation Error Bag Component Reference --}}
            <x-forms.top-errors wrapperClass="pfe-alert-box" />

            {{-- AJAX Request Error Container --}}
            <div class="pfe-alert-box cascading-ajax-errors hidden" role="alert" aria-live="polite"></div>

            <div id="category_cascading_hub" data-active-path="{{ json_encode($fullPathArray) }}">
                <label>Category Pathway Branch</label>

                <div class="cascading-level-div" data-level-row="1">
                    <select class="category-select" data-level="1">
                        <option value="">Choose Broad Category</option>
                        @if (isset($categories))
                            @php
                                $rootParentSlug = null;
                                $currentCategory = $associateModel?->category ?? null;
                                while ($currentCategory) {
                                    $rootParentSlug = $currentCategory->slug;
                                    $currentCategory = $currentCategory->parent;
                                }
                                $selectedRootSlug = old('parent_category_slug', $rootParentSlug);
                            @endphp

                            @foreach ($categories as $parentCategory)
                                <option value="{{ $parentCategory->slug }}" data-slug="{{ $parentCategory->slug }}"
                                    {{ $selectedRootSlug == $parentCategory->slug ? 'selected' : '' }}>
                                    {{ $parentCategory->name }}
                                </option>
                            @endforeach
                        @endif
                    </select>

                    <input type="text" class="tier-name-input" data-level="1" placeholder="Rename tier...">
                    <button type="button" class="btn-rename-tier pl-purple" data-level="1"
                        data-hint="Submit Renamed Category">Rename
                        Category</button>
                    <button type="button" class="btn-add-tier pl-green" data-level="1"
                        data-hint="Generate Form Field To Add New Category">+ New Missing
                        Category</button>
                    <button type="button" class="btn-remove-tier pl-red" data-level="1"
                        data-hint="Delete Selected Category">✕ Remove Selected</button>

                    <div class="inline-add-container hidden" data-level="1">
                        <input type="text" class="new-item-input" data-level="1" placeholder="New category name...">
                        <button type="button" class="btn-save-item pl-blue" data-level="1"
                            data-hint="Store Entered Category">Save</button>
                    </div>
                </div>
            </div>
        </form>
    </div>
</div>

<x-forms.form-field type="hidden" name="category_id" id="final_category_target" :value="old('category_id', $associateModel?->category_id ?? '')" required />
