import React, { memo, useMemo } from 'react';
import { View, ViewStyle, ListRenderItem, FlatList } from 'react-native';

interface OptimizedListProps<T> {
  data: T[];
  renderItem: ListRenderItem<T>;
  keyExtractor: (item: T, index: number) => string;
  style?: ViewStyle;
  contentContainerStyle?: ViewStyle;
  showsVerticalScrollIndicator?: boolean;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
  ListHeaderComponent?: React.ComponentType<any> | React.ReactElement | null;
  ListFooterComponent?: React.ComponentType<any> | React.ReactElement | null;
  numColumns?: number;
  horizontal?: boolean;
}

function OptimizedListComponent<T>({
  data,
  renderItem,
  keyExtractor,
  style,
  contentContainerStyle,
  showsVerticalScrollIndicator = false,
  onEndReached,
  onEndReachedThreshold = 0.1,
  ListHeaderComponent,
  ListFooterComponent,
  numColumns = 1,
  horizontal = false,
}: OptimizedListProps<T>) {
  // Memoize the render item to prevent unnecessary re-renders
  const memoizedRenderItem = useMemo(() => {
    return renderItem;
  }, [renderItem]);

  // Memoize data to prevent unnecessary re-renders when data reference changes
  const memoizedData = useMemo(() => data, [data]);

  return (
    <View style={style}>
      <FlatList
        data={memoizedData}
        renderItem={memoizedRenderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={contentContainerStyle}
        showsVerticalScrollIndicator={showsVerticalScrollIndicator}
        onEndReached={onEndReached}
        onEndReachedThreshold={onEndReachedThreshold}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        numColumns={numColumns}
        horizontal={horizontal}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={8}
        updateCellsBatchingPeriod={50}
        disableVirtualization={false}
        getItemLayout={undefined}
      />
    </View>
  );
}

export const OptimizedList = memo(OptimizedListComponent) as <T>(
  props: OptimizedListProps<T>
) => React.ReactElement;
