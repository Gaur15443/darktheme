#!/bin/bash

echo "Checking 16KB page size compatibility for all native libraries..."
echo "=================================================================="
echo ""

# Function to check if a library supports 16KB pages
check_16kb_compat() {
    local lib_path="$1"
    local lib_name=$(basename "$lib_path")
    
    # Check segment alignment using readelf
    local alignment_check=$(readelf -l "$lib_path" 2>/dev/null | grep -E "LOAD.*0x[0-9a-fA-F]+$" | awk '{print $NF}')
    
    local has_issue=false
    local issues=""
    
    # Check each LOAD segment alignment
    while IFS= read -r align; do
        if [ -n "$align" ]; then
            # Convert hex to decimal
            align_decimal=$((align))
            
            # Check if alignment is less than 16KB (65536 bytes)
            if [ "$align_decimal" -lt 65536 ] && [ "$align_decimal" -gt 4096 ]; then
                has_issue=true
                issues="$issues Segment alignment: $align ($(($align_decimal)) bytes) "
            fi
        fi
    done <<< "$alignment_check"
    
    # Also check section alignment
    local section_alignment=$(readelf -S "$lib_path" 2>/dev/null | grep -E "\.(text|data|bss)" | awk '{print $(NF-1)}' | head -3)
    
    if [ "$has_issue" = true ]; then
        echo "❌ INCOMPATIBLE: $lib_name"
        echo "   Issues: $issues"
        echo ""
        return 1
    else
        echo "✅ COMPATIBLE: $lib_name"
        return 0
    fi
}

# Count compatible and incompatible libraries
compatible_count=0
incompatible_count=0
incompatible_libs=()

# Check arm64-v8a libraries (most relevant for modern devices)
echo "Checking arm64-v8a libraries:"
echo "-----------------------------"

for lib in lib/arm64-v8a/*.so; do
    if [ -f "$lib" ]; then
        if check_16kb_compat "$lib"; then
            ((compatible_count++))
        else
            ((incompatible_count++))
            incompatible_libs+=("$(basename "$lib")")
        fi
    fi
done

echo ""
echo "Summary for arm64-v8a:"
echo "====================="
echo "✅ Compatible libraries: $compatible_count"
echo "❌ Incompatible libraries: $incompatible_count"

if [ $incompatible_count -gt 0 ]; then
    echo ""
    echo "Incompatible libraries list:"
    for lib in "${incompatible_libs[@]}"; do
        echo "  - $lib"
    done
    echo ""
    echo "🔍 Detailed analysis needed for incompatible libraries"
    echo "💡 Consider updating these libraries or checking with vendors for 16KB page size support"
fi

echo ""
echo "Note: This analysis focuses on segment alignment. For complete 16KB page size compatibility,"
echo "additional factors like memory allocation patterns may need to be considered."


