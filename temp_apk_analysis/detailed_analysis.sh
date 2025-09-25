#!/bin/bash

echo "Detailed 16KB Page Size Compatibility Analysis"
echo "=============================================="
echo ""

# Function to analyze a specific library in detail
analyze_library() {
    local lib_path="$1"
    local lib_name=$(basename "$lib_path")
    
    echo "📖 Analyzing: $lib_name"
    echo "----------------------------------------"
    
    # Get detailed segment information
    readelf -l "$lib_path" 2>/dev/null | grep -A 1 -B 1 "LOAD"
    
    echo ""
    echo "Segment alignment analysis:"
    readelf -l "$lib_path" 2>/dev/null | grep "LOAD" | while read line; do
        align=$(echo "$line" | awk '{print $NF}')
        if [ -n "$align" ]; then
            align_decimal=$((align))
            if [ "$align_decimal" -lt 65536 ] && [ "$align_decimal" -gt 4096 ]; then
                echo "  ⚠️  Problematic alignment: $align ($align_decimal bytes) - Less than 16KB"
            else
                echo "  ✅ Good alignment: $align ($align_decimal bytes)"
            fi
        fi
    done
    
    echo ""
    echo "=========================================="
    echo ""
}

# Analyze the most critical libraries that are incompatible
echo "Analyzing key incompatible libraries:"
echo ""

critical_libs=(
    "lib/arm64-v8a/libhermes.so"
    "lib/arm64-v8a/libhermesinstancejni.so"
    "lib/arm64-v8a/libreactnativejni.so"
    "lib/arm64-v8a/libfb.so"
    "lib/arm64-v8a/libreact_render_core.so"
    "lib/arm64-v8a/librrc_native.so"
)

for lib in "${critical_libs[@]}"; do
    if [ -f "$lib" ]; then
        analyze_library "$lib"
    fi
done


